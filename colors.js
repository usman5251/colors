window.addEventListener('DOMContentLoaded', () => {
    //sync databases
    var localDB = new PouchDB('colors');
    var remoteDB = new PouchDB('http://ec2-3-85-5-117.compute-1.amazonaws.com:5984/colors');
    localDB.sync(remoteDB).on('complete', function () {
        console.log('Yay, we are in sync!')
    }).on('error', function (err) {
        console.log('Error while syncing database')
    });

    localDB.get('ColorAttr').then(function (doc) {
        var cats = JSON.parse(doc.colors);
        console.log(JSON.parse(doc.colors));
        for (var key in cats) {
            if (cats.hasOwnProperty(key)) {
                var val = cats[key];
                console.log(val)
                document.querySelector('#colorsDeleteModal').innerHTML += `<option>${val.title}</option>`;
                document.querySelector('#color').innerHTML += `<option>${val.title}</option>`;
                document.querySelector('#colorUpdate').innerHTML += `<option>${val.title}</option>`;
                console.log(val.title);
            }
        }
    }).catch(function (err) {
        console.log(err);
    });
    document.querySelector('#addColor').addEventListener('click', () => {
        var bool = false;
        var newcat = document.querySelector('#colorInputModal').value;
        if (newcat == '') {
            alert('Please enter a color');
            return;
        }
        console.log('licked')
        localDB.get('ColorAttr').then(function (doc) {
            var cats = JSON.parse(doc.colors);
            for (var key in cats) {
                if (cats.hasOwnProperty(key)) {
                    var val = cats[key];
                    console.log(val);
                    console.log(val.title.toString().toLowerCase())
                    if (val.title.toString().toLowerCase() == `${newcat.toString().toLowerCase()}`) {
                        alert('Color already added');
                        bool = true;
                        break;
                    }
                }
            }
            if (bool == false) {
                newobj = {
                    "title": `${newcat}`
                }
                cats[`${newcat}`] = newobj

                catsjson = JSON.stringify(cats, null, 4);
                localDB.get(`ColorAttr`).then(function (doc) {
                    return localDB.put({
                        _id: doc._id,
                        _rev: doc._rev,
                        colors: `${catsjson}`
                    });
                }).then(function (response) {
                    alert("Color Added Successfully");
                }).catch(function (err) {
                    console.log(err);
                });
                setTimeout(function () {
                    location.reload(true);
                }, 500);
            }
        });
    });
    // DELETE
    document.querySelector('#deleteColor').addEventListener('click', () => {
        var bool = false;
        var newcat = document.querySelector('#colorsDeleteModal').value;
        localDB.get('ColorAttr').then(function (doc) {
            var cats = JSON.parse(doc.colors.replace("\"", '"'));
            console.log(doc.colors);
            for (var key in cats) {
                if (cats.hasOwnProperty(key)) {
                    console.log('jh')
                    var val = cats[key];
                    if (val.title.toString().toLowerCase() == `${newcat.toString().toLowerCase()}`) {

                        delete cats[`${val.title}`];
                        catsjson = JSON.stringify(cats, null, 4);
                        console.log(cats);
                        localDB.get(`ColorAttr`).then(function (doc) {
                            return localDB.put({
                                _id: doc._id,
                                _rev: doc._rev,
                                colors: `${catsjson}`
                            });
                        }).then(function (response) {
                            alert("Color Deleted Successfully");
                        }).catch(function (err) {
                            console.log(err);
                        });
                        bool = true;
                        break;
                    }
                }
            }
            if (bool == false) {
                alert('Color not found');
            } else {
                setTimeout(function () {
                    location.reload(true);
                }, 500);
            }
        });
    });
});