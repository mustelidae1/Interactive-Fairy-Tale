fetch("localhost:3000/newOption", {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({
        "title": "test1",  
        "text": "test1", 
        "before": "Beginning of the Story", 
        "after": "End of the Story"  
    })
  }).then(res => {
    console.log("Request complete! response:", res);
  });