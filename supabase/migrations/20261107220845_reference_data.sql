-- SPORTS: the v1 list (same as the app's create-game options; Felipe can still change it)
insert into public.sports (code, name) values
  ('basketball', 'Basketball'),
  ('soccer', 'Soccer'),
  ('volleyball', 'Volleyball'),
  ('tennis', 'Tennis'),
  ('pickleball', 'Pickleball'),
  ('flag_football', 'Flag Football');

-- LOCATIONS: game spots on both campuses. Names are placeholders; photos not added yet.
insert into public.locations (campus, name, latitude, longitude) values
  ('MMC', 'Basketball Court 1', 25.755328666748763, -80.37763464304088),
  ('MMC', 'Basketball Court 2', 25.75533830164072, -80.37747061290928),
  ('MMC', 'Basketball Court 3', 25.7550004157918, -80.37692648703135),
  ('MMC', 'Basketball Court 4', 25.759323704927574, -80.38067713467649),
  ('MMC', 'Soccer & Flag Football Field', 25.759918318235446, -80.38025982629475),
  ('MMC', 'Soccer Field 2', 25.759667308481397, -80.37941690904178),
  ('MMC', 'Volleyball Court', 25.75846724494054, -80.38103066805381),
  ('MMC', 'Tennis & Pickleball Courts', 25.758053507241744, -80.38150346178388),
  ('BBC', 'Basketball Court', 25.911979597759256, -80.1391508708645),
  ('BBC', 'Soccer & Flag Football Field', 25.912600620942023, -80.13924056719246),
  ('BBC', 'Volleyball Court', 25.908603992545867, -80.13830532914595),
  ('BBC', 'Tennis & Pickleball Courts', 25.91213387084249, -80.1384920524884);
