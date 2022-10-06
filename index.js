const fs = require("fs");
const bodyParser = require("body-parser");
const express = require('express');
const cheerio = require("cheerio");

const app = express(); // Set up web server 
const port = 3000;

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
}); 

app.listen(port,() => { // Start the web server 
    console.log(`App running on port ${port}`);
})

// Helper Functions -------------------------------------------
function setupHTML() { // Add passages from the JSON storage to the HTML so they will be displayed in the Twine 
    fs.readFile(jsonFile, "utf8", (err, jsonString) => { 
        if (err) {
          console.log("JSON file read failed:", err);
          return;
        }
        try {
            const newOptions = JSON.parse(jsonString).data; // Get the stored passages from the JSON object 

            fs.readFile(htmlFile, function(err, data) { // Read the HTML file 
                const $ = cheerio.load(data); 
                passages = $("tw-passagedata"); // Find existing passages  
                storyData = $("tw-storydata");  // Find the top-level node that all the passages are children of 
                numPassages = passages.length; // Get the number of passages 

                newOptions.forEach(o => {
                    //check if the passage is already in the HTML 
                    if ($(`tw-passagedata[name="${o.title}"]`).length == 0) {
                        // Add the passage to the HTML 
                        var str = `<tw-passagedata pid="${++numPassages}" name="${o.title}" tags="custom" position="775,450" size="100,100">${o.text}\n\n [[Next|${o.after}]] </tw-passagedata>`; 
                        storyData.append(str); 

                        // Add a link to the new passage in the previous passage 
                        prevPassage = $(`tw-passagedata[name="${o.before}"]`); 
                        prevPassageText = prevPassage.text(); 
                        prevPassage.text(prevPassageText + `[[${o.title}]]\n`);
                    }
                })

                // write back to HTML file 
                var newFile = $.html() 
                fs.writeFile(htmlFile, newFile, err => {
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

/*addtoJSON({
    "title": "Test",  
    "text": "test", 
    "before": "Beginning of the Story", 
    "after": "End of the Story"  
})*/
setupHTML(); 