# Interactive-Fairy-Tale

This choose your own adventure, built with Twine, mimics the evolution of traditional oral stories. Users can add their own branches to the story which are shared with everyone, creating an ever-expanding tale. This project includes a custom node.js server which extends the functionality of Twine to allow for players to add their own passages to the story.

## Web Link 

Coming soon 

## How to Run the Server
1. Clone the repo 
2. Donwload node.js (https://nodejs.org/en/download/) 
3. Open a terminal in the location of the repo on your machine 
4. Run the following command to install dependencies: ```npm install``` (only needed the first time) 
5. Run the following command to start the server: ```node index.js``` 
6. Leave the terminal open, and navigate to localhost:3000 in a web browser 
7. You should see the Twine! 
8. If you need to restart the server, return to the terminal, press Ctrl+C and then run ```node index.js``` again 

## How Does it Work? 
On its own, Twine does not support the addition of new passages by players. To get around this, I am using a node.js server to display the Twine and add some additional functionality. When a user adds a passage, the Twine makes a post call to the server, which saves that passage in a local json file. Then, the server uses the info from the json file to update the HTML of the Twine, so all user-added options will show up in the story during subsequent play-throughs.

## Files 
* **Readme.md**: this file
* **index.js**: the main node.js server 
* **public/index.html**: the Twine (you can import this file into the Twine editor to make changes to it) 
* **public/index backup.html**: not used by the program, just a backup of the Twine file because the server makes changes to it
* **passages.json**: stores all of the passages added by users 

## Known Issues 
* It is not supported to have multiple passages of the same name, nor is this case currently being handled in the code. For now, avoid attempting to add a duplicate passage. 
* There is currently not an easy way to delete user-added passages other than manually deleting them from passages.json and index.html. 
* This is not a scalable solution - eventually we would want a proper database instead of using a local json file for storage 
