const fs = require("fs") 
const bodyParser = require("body-parser")
const express = require('express')
const cheerio = require("cheerio");

const app = express() // Setting up web server 
const port = 3000

const jsonFile = "./passages.json"
const htmlFile = "./public/index.html"

app.use(express.static('public')) // Identify the directory of the Twine 

app.use(bodyParser.urlencoded({ extended: false })); // Settings so we can read JSON 
app.use(bodyParser.json());

app.get('/', (req, res) => { // Display the Twine at the main server address 
    res.send(""); 
});

app.post('/newOption', (req, res) => { // Add a new option  
    console.log(req.body)

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
    console.log(`App running on port ${port}`)
})


function setupHTML() { 
    fs.readFile(jsonFile, "utf8", (err, jsonString) => { 
        if (err) {
          console.log("JSON file read failed:", err);
          return;
        }
        try {
            const newOptions = JSON.parse(jsonString).data;

            fs.readFile(htmlFile, function(err, data) {
                const $ = cheerio.load(data);
                passages = $("tw-passagedata"); 
                storyData = $("tw-storydata"); 
                numPassages = passages.length; 

                newOptions.forEach(o => {
                    //only add if the passage is not already in the html 
                    if ($(`tw-passagedata[name="${o.title}"]`).length == 0) {
                        console.log("GOT HERE"); 
                        // Add the passage to the HTML 
                        console.log("JSON: ", o, o.title, o.text, o.after)
                        var str = `<tw-passagedata pid="${++numPassages}" name="${o.title}" tags="custom" position="775,450" size="100,100">${o.text}\n\n [[Next|${o.after}]] </tw-passagedata>`
                        storyData.append(str) // append adds it inside, which we do not want. We want it after 
                        //console.log(passages)

                        // Add a link for the new passage to the previous passage 
                        prevPassage = $(`tw-passagedata[name="${o.before}"]`)
                        prevPassageText = prevPassage.text() 
                        prevPassage.text(prevPassageText + `[[${o.title}]]\n`)
                        console.log("PREV TEXT: ", prevPassage.text())
                    }
                })

                // write back to HTML file 
                var newFile = $.html() 
                fs.writeFile(htmlFile, newFile, err => {
                    if (err) {
                        console.log('Error writing HTML file', err)
                    } else {
                        console.log('Successfully wrote HTML file')
                    }
                })
            });

          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
      });
}

function addtoJSON(newOption) {
    fs.readFile(jsonFile, "utf8", (err, jsonString) => {
        if (err) {
          console.log("JSON file read failed:", err);
          return;
        }
        console.log("JSON File data:", jsonString);
        try {
            const options = JSON.parse(jsonString);
            //console.log("JSON", options.data); 
            options.data.push(newOption); 
            const newFile = JSON.stringify(options); 
            fs.writeFile(jsonFile, newFile, err => {
                if (err) {
                    console.log('Error writing JSON file', err)
                } else {
                    console.log('Successfully wrote JSON file')
                }
                setupHTML()
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
setupHTML()