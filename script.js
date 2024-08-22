let imageURL;

function submitHandler() {
    console.log("click");
    const fileinput = document.getElementById('fileinput');
    console.log(fileinput.files);

    if (fileinput.files.length === 0) {
        document.getElementById('err').innerHTML = "<h1 style='background-color: #fff; padding: 15px; border-radius: 15px;'>Error ! No File Selacted</h1>"
        return;
    }

    const image = fileinput.files[0];

    const formData = new FormData();
    formData.append('image_file', image);
    formData.append('size', 'auto');

    const apikey = 'LqUoYWpWtj4xzC6E5r5pee2i';

    fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': apikey,
        },
        body: formData
    })

        .then(function (response) {
            return response.blob()
        })

        .then(function (blob) {
            console.log(blob);
            const url = URL.createObjectURL(blob);
        
            const img = document.createElement('img');
            img.src = url;
        
            const imgOutputDiv = document.getElementById('imgOutput');
            imgOutputDiv.insertBefore(img, imgOutputDiv.firstChild);
        
            const downloadButton = imgOutputDiv.querySelector('button');
            downloadButton.style.display = 'inline-block'; 
        
            imageURL = url;
        })
        
        .catch(function (error) {
            document.getElementById('err').innerHTML = "<h1 style='background-color: #fff; padding: 15px; border-radius: 15px;'>Error ! No Internet :( </h1>"
            return;
        });
}

function downloadfile() {
    var a = document.createElement('a');
    a.href = imageURL;
    a.download = 'abc.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
