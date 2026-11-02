# **PantherPlay Social Tab Scope**

## **1\. Overview**

The Social tab will allow PantherPlay users to connect with friends and other students who enjoy playing sports. The goal is to make it easier for students to meet people, organize pickup games, and stay connected with teammates.

## **2\. Features**

### **Friends List**

* Display a list of the user's friends.  
* Show each friend's name and profile picture.  
* Allow users to search for friends.  
* Allow users to view another student's profile.  
* Include an option to add new friends.

### **Chats**

* Display conversations with friends and pickup game groups.  
* Show the latest message and its timestamp.  
* Highlight unread conversations.  
* Allow users to filter conversations by All, Groups, and Unread.  
* Allow users to open individual or group conversations.

### **Group Chats**

* Allow players in the same pickup game to communicate.  
* Display group conversations based on sports or pickup games.  
* Help players coordinate game times, locations, and availability.

## **3\. Screen Layout**

The proposed mockup includes:

* PantherPlay header with campus selector (MMC).  
* Search bar for finding people.  
* Two main tabs: Chats and Friends.  
* Conversation filters: All, Groups, and Unread.  
* List items with profile pictures, names, and supporting information.  
* Bottom navigation with Discover, Map, [+], Social, and Profile.

### Social Tab Mockup

![PantherPlay Social Tab Mockup](images/social-tab-mockup.png)

## **4\. Out of Scope**

### **Left out of this ticket (W2-09)**

These need their own tickets:

* Real chat: sending and receiving messages, or storing them. The Chats list only shows mock data.
* A friend-requests backend: sending, accepting, or storing friend requests.
* Any database tables or Supabase calls for the Social tab.

### **Planned, but not in the skeleton yet**

These features are in the sections above, but the current screen doesn't have them:

* PantherPlay header with the campus selector.
* Profile pictures (the skeleton shows initials).
* The add-friend option.
* Opening an individual or group conversation.
* Viewing another student's profile.

### **Not included**

* Showing what friends are playing. It was suggested for this tab, but it isn't part of this scope.
