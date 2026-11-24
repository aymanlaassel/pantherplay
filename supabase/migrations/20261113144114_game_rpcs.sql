-- W3-05: the four functions the app calls to create, join, leave and cancel games.
-- games and game_players have no insert policy, so these are the only way to add rows.
--
-- Every function:
--   * is `security definer`: it runs with the owner's rights, so it can write past RLS.
--   * sets `search_path = ''` and names every table in full (public.games), so nobody can
--     trick it into using a look-alike table.
--   * takes the user from auth.uid() (the signed-in user), never from an argument.

-- CREATE: posts a game and adds the host as joined, in one step.
create function public.create_game(
    p_sport text,
    p_location_id uuid,
    p_starts_at timestamptz,
    p_duration_minutes int,
    p_max_players int,
    p_skill_level public.skill_level,
    p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_game_id uuid;
begin
    if v_user is null then
        raise exception 'Not signed in';
    end if;
    if p_starts_at <= now() then
        raise exception 'Start time must be in the future';
    end if;
    if p_duration_minutes not in (60, 90, 120) then
        raise exception 'Duration must be 60, 90 or 120 minutes';
    end if;

    insert into public.games (host_id, sport, location_id, starts_at, duration_minutes, skill_level, max_players, notes)
    values (v_user, p_sport, p_location_id, p_starts_at, p_duration_minutes, p_skill_level, p_max_players,
            nullif(trim(p_notes), ''))  -- the app sends '' for no notes; store null
    returning id into v_game_id;

    insert into public.game_players (game_id, user_id, status)
    values (v_game_id, v_user, 'joined');

    return v_game_id;
end;
$$;
comment on function public.create_game is 'Posts a game with the signed-in user as host and first joined player. Returns the game id.';

-- JOIN: joined if there is room, waitlisted if full. Returns which one.
create function public.join_game(p_game_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_game public.games;
    v_current public.player_status;
    v_joined int;
    v_status public.player_status;
begin
    if v_user is null then
        raise exception 'Not signed in';
    end if;

    -- Lock the game row: if two people join at the same moment, the second waits here
    -- until the first is done, then counts again. This is what stops overbooking.
    select * into v_game from public.games where id = p_game_id for update;
    if not found then
        raise exception 'Game not found';
    end if;
    if v_game.status = 'cancelled' then
        raise exception 'Game is cancelled';
    end if;
    if v_game.starts_at <= now() then
        raise exception 'Game has already started';
    end if;

    -- Already in: answer with their current place, don't add a second row.
    select status into v_current
    from public.game_players
    where game_id = p_game_id and user_id = v_user;
    if v_current in ('joined', 'waitlisted') then
        return v_current;
    end if;

    select count(*) into v_joined
    from public.game_players
    where game_id = p_game_id and status = 'joined';

    v_status := case when v_joined < v_game.max_players then 'joined' else 'waitlisted' end;

    -- New player: insert. Someone who left earlier: reuse their row, back of the line.
    insert into public.game_players (game_id, user_id, status)
    values (p_game_id, v_user, v_status)
    on conflict (game_id, user_id) do update
        set status = excluded.status, joined_at = now();

    return v_status;
end;
$$;
comment on function public.join_game is 'Joins the signed-in user to a game. Returns joined, or waitlisted if the game is full.';

-- LEAVE: marks the player as left. If they had a spot, the first waitlisted player gets it.
create function public.leave_game(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_game public.games;
    v_current public.player_status;
    v_joined int;
begin
    if v_user is null then
        raise exception 'Not signed in';
    end if;

    -- Same lock as join_game, so a leave and a join can't count spots at the same time.
    select * into v_game from public.games where id = p_game_id for update;
    if not found then
        raise exception 'Game not found';
    end if;

    select status into v_current
    from public.game_players
    where game_id = p_game_id and user_id = v_user;
    if v_current is null or v_current = 'left' then
        return;  -- not in the game: nothing to do
    end if;

    update public.game_players
    set status = 'left'
    where game_id = p_game_id and user_id = v_user;

    -- Promote only if a spot really opened (and the game is still on).
    if v_current = 'joined' and v_game.status <> 'cancelled' then
        select count(*) into v_joined
        from public.game_players
        where game_id = p_game_id and status = 'joined';

        if v_joined < v_game.max_players then
            update public.game_players
            set status = 'joined'
            where game_id = p_game_id
              and user_id = (
                  select user_id from public.game_players
                  where game_id = p_game_id and status = 'waitlisted'
                  order by joined_at, user_id  -- earliest first
                  limit 1
              );
        end if;
    end if;
end;
$$;
comment on function public.leave_game is 'Marks the signed-in user as left and promotes the earliest waitlisted player into the open spot.';

-- CANCEL: only the host can cancel their game.
create function public.cancel_game(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_host uuid;
begin
    if v_user is null then
        raise exception 'Not signed in';
    end if;

    select host_id into v_host from public.games where id = p_game_id for update;
    if not found then
        raise exception 'Game not found';
    end if;
    -- `is distinct from`, not `<>`: if a game ever has no host, `<>` gives null and would let anyone through.
    if v_host is distinct from v_user then
        raise exception 'Only the host can cancel this game';
    end if;

    update public.games set status = 'cancelled' where id = p_game_id;
end;
$$;
comment on function public.cancel_game is 'Cancels a game. Only its host may do this.';

-- Only signed-in users may call these (by default anyone, even logged out, could).
revoke execute on function public.create_game, public.join_game, public.leave_game, public.cancel_game from public, anon;
grant execute on function public.create_game, public.join_game, public.leave_game, public.cancel_game to authenticated;
