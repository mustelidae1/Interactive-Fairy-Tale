const fs = require("fs");
const bodyParser = require("body-parser");
const express = require('express');
const cheerio = require("cheerio");
const htmlParser = require("node-html-parser"); 
const { allowedNodeEnvironmentFlags } = require("process");

const app = express(); // Set up web server 
const port = process.env.PORT || 3000;

const jsonFile = "./passages.json";
const htmlFile = "./public/index.html";

app.use(express.static('public')); // Identify the directory of the Twine so we can serve it statically 

app.use(bodyParser.urlencoded({ extended: false })); // Settings so we can read JSON 
app.use(bodyParser.json());

app.get('/', (req, res) => { // Display the Twine at the main server address 
    res.send(""); 
});

app.post('/newOption', (req, res) => { // Add a new passage to the story 
    console.log("Adding new passage: ", req.body)

    var newOption = {
        "title": req.body.title,  
        "text": req.body.text, 
        "before": req.body.before, 
        "after": req.body.after 
    }
    
    // add option to the JSON object 
    addtoJSON(newOption); 

    res.end(); 
}); 

app.post('/newVar', (req, res) => { // Add a new variable option to the story 
    console.log("Adding new var: ", req.body) 

    var newVar = {
        "name": req.body.name, 
        "value": req.body.value,
        "pageSet": req.body.pageSet, // the Twine page on which the var is set 
        "nextPage": req.body.nextPage
    }

    addVar(newVar); 

    res.end(); 
})

app.post('/switchCss', (req, res) => { // Switch the css background 
    console.log("Switching background: ", req.body); 

    var cssName = req.body.name; 

    switchCSS(cssName); 
}); 

app.listen(port,() => { // Start the web server 
    console.log(`App running on port ${port}`);
})

// Helper Functions -------------------------------------------
function setupHTML() { // Add variables from the JSON storage to the HTML so they will be displayed in the Twine 
    fs.readFile(jsonFile, "utf8", (err, jsonString) => { 
        if (err) {
          console.log("JSON file read failed:", err);
          return;
        }
        try {
            const parsedJSON = JSON.parse(jsonString); 
            const varOptions = parsedJSON.vars; // Get the stored vars from the JSON object 

            fs.readFile(htmlFile, 'utf8', function(err, data) { // Read the HTML file 
                const root = htmlParser.parse(data); 
                passages = root.querySelector("tw-passagedata"); // Find existing passages  

                // Add links for all of the user variables 
                // for each variable, find the page where that variable is an option and then add a link 
                varOptions.forEach(o => {
                    //find the passage to add a link to 
                    passage = root.querySelector(`tw-passagedata[name="${o.pageSet}"]`); 
                    if (passage) {

                        // check if the option is already on the page
                        passageText = passage.innerText;  
                        if (!passageText.includes(o.value)) {
                            splitText = passageText.split("&lt;&lt;textbox"); 
                            //passage.textContent = passageText + `\n&lt;&lt;link[[${o.value}|${o.nextPage}]]&gt;&gt;&lt;&lt;set $${o.name} to "${o.value}"&gt;&gt;&lt;&lt;/link&gt;&gt;`;
                            passage.textContent = splitText[0].trim() + `&nbsp&lt;&lt;link[[${o.value}|${o.nextPage}]]&gt;&gt;&lt;&lt;set $${o.name} to "${o.value}"&gt;&gt;&lt;&lt;/link&gt;&gt;&nbsp` + "&lt;&lt;textbox" + splitText[1];
                        }

                    } 
                }); 

                // write back to HTML file 
                var newFile = root.outerHTML;  
                fs.writeFile(htmlFile, newFile, 'utf8', err => {
                    if (err) {
                        console.log('Error writing HTML file', err);
                    } else {
                        console.log('Successfully wrote HTML file');
                    }
                }); 
            });

          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
      });
}

function switchCSSOld(name) {
    fs.readFile(htmlFile, 'utf8', function(err, data) { // Read the HTML file 
        const $ = cheerio.load(data); 

        $('link[rel="stylesheet"]').last().attr("href", name + ".css"); // change where the css link points to 

        // write back to HTML file 
        var newFile = $.html() 
        console.log("CSS: " + newFile.length);
        if (newFile.length <= 100) return;
        fs.writeFile(htmlFile, newFile, 'utf8', err => {
            if (err) {
                console.log('Error writing HTML file', err);
            } else {
                console.log('Successfully wrote HTML file');
            }
        }); 
    });
}

function switchCSS(name) {
    fs.readFile(htmlFile, 'utf8', function(err, data) { // Read the HTML file 
        const root = htmlParser.parse(data); 

        var head = root.querySelector("head"); 
        head.appendChild(`<link rel="stylesheet" href="${name}.css">`)
        //var links = root.querySelectorAll("link"); 
        //links[links.length-1].insertAdjacentHTML("afterend", `<link rel="stylesheet" href="${name}.css">`); 
        
        //.setAttribute("href", name + ".css"); // change where the css link points to 

        // write back to HTML file 
        var newFile = root.outerHTML;  
        fs.writeFile(htmlFile, newFile, 'utf8', err => {
            if (err) {
                console.log('Error writing HTML file', err);
            } else {
                console.log('Successfully wrote HTML file');
            }
        }); 
    });
}

function addtoJSON(newOption) { // add a new passage to the JSON storage 
    fs.readFile(jsonFile, "utf8", (err, jsonString) => { // read the JSON file 
        if (err) {
          console.log("JSON file read failed:", err);
          return;
        }
        try {
            const options = JSON.parse(jsonString); // Parse the JSON file 
            options.data.push(newOption); // Add the new passage 
            const newFile = JSON.stringify(options); 
            fs.writeFile(jsonFile, newFile, err => { // Write the new data to the JSON file 
                if (err) {
                    console.log('Error writing JSON file', err);
                } else {
                    console.log('Successfully wrote JSON file');
                }
                setupHTML(); // Update the HTML with the new passage
            })
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
      });
      
}

function addVar(newVar) { // add a new variable option to the JSON storage 
    fs.readFile(jsonFile, "utf8", (err, jsonString) => { // read the JSON file 
        if (err) {
          console.log("JSON file read failed:", err);
          return;
        }
        try {
            const options = JSON.parse(jsonString); // Parse the JSON file 
            if(!options.vars.some(e => e.value == newVar.value)) options.vars.push(newVar); // Add the new variable option if it's not already there
            if(newVar.value == "Enter new option" || newVar.value == "Enter new time period" || newVar.value == "Enter new name") return; // Don't accept the default value 
            const newFile = JSON.stringify(options); 
            fs.writeFile(jsonFile, newFile, err => { // Write the new data to the JSON file 
                if (err) {
                    console.log('Error writing JSON file', err);
                } else {
                    console.log('Successfully wrote JSON file');
                }
                setupHTML(); // Update the HTML with the new variable
            })
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
      });
}

setupHTML(); 
//switchCSS("magic"); 
