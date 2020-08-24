window.addEventListener('DOMContentLoaded', () => {
    //sync databases
    var localDB = new PouchDB('colors');
    var remoteDB = new PouchDB('http://ec2-3-85-5-117.compute-1.amazonaws.com:5984/colors');
    localDB.sync(remoteDB).on('complete', function () {
        console.log('Yay, we are in sync!')
    }).on('error', function (err) {
        console.log('Error while syncing database')
    });

    localDB.get('categories').then(function (doc) {
        var cats = JSON.parse(doc.categories);
        console.log(JSON.parse(doc.categories));
        for (var key in cats) {
            if (cats.hasOwnProperty(key)) {
                var val = cats[key];
                document.querySelector('#category').innerHTML += `<option>${val.title}</option>`;
                document.querySelector('#categorymodal').innerHTML += `<option>${val.title}</option>`;
                console.log(val.title);
            }
        }
    }).catch(function (err) {
        console.log(err);
    });
    document.querySelector('#add').addEventListener('click', () => {
        var bool = false;
        var newcat = document.querySelector('#newcat').value;
        if (newcat == '') {
            alert('Please enter a category');
            return;
        }
        localDB.get('categories').then(function (doc) {
            var cats = JSON.parse(doc.categories);
            for (var key in cats) {
                if (cats.hasOwnProperty(key)) {
                    var val = cats[key];
                    console.log(val.title.toString().toLowerCase())
                    if (val.title.toString().toLowerCase() == `${newcat.toString().toLowerCase()}`) {
                        alert('category already added');
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
                localDB.get(`categories`).then(function (doc) {
                    return localDB.put({
                        _id: doc._id,
                        _rev: doc._rev,
                        categories: `${catsjson}`
                    });
                }).then(function (response) {
                    alert("Category Added Successfully");
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
    document.querySelector('#delete').addEventListener('click', () => {
        var bool = false;
        var newcat = document.querySelector('#category').value;
        localDB.get('categories').then(function (doc) {
            var cats = JSON.parse(doc.categories.replace("\"", '"'));
            console.log(doc.categories);
            for (var key in cats) {
                if (cats.hasOwnProperty(key)) {
                    console.log('jh')
                    var val = cats[key];
                    if (val.title.toString().toLowerCase() == `${newcat.toString().toLowerCase()}`) {

                        delete cats[`${val.title}`];
                        catsjson = JSON.stringify(cats, null, 4);
                        console.log(cats);
                        localDB.get(`categories`).then(function (doc) {
                            return localDB.put({
                                _id: doc._id,
                                _rev: doc._rev,
                                categories: `${catsjson}`
                            });
                        }).then(function (response) {
                            alert("Category Deleted Successfully");
                        }).catch(function (err) {
                            console.log(err);
                        });
                        bool = true;
                        break;
                    }
                }
            }
            if (bool == false) {
                alert('Category not found');
            } else {
                setTimeout(function () {
                    location.reload(true);
                }, 500);
            }
        });
    });
});