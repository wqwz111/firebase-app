const functions = require('firebase-functions');
const admin = require('firebase-admin')
const url = require('url');
admin.initializeApp(functions.config().firebase);

exports.cleanup = functions.https.onRequest((req, res) => {
    const currentTime = new Date().getTime();
    const oneDayAgo = currentTime - 24*60*60*1000;//86400000;
    var roomCount = 0;
    admin.database().ref('/rooms').orderByChild('createdTime')
    .endAt(oneDayAgo).once('value').then(snap => {
        snap.forEach(room => {
            console.log(room.key);
            admin.database().ref(url.parse(room.ref.toString()).pathname).remove();
            roomCount++;
        });
        res.status(200).send('Rooms cleanup finished. ' + roomCount + ' rooms removed.');
    });
});

const qiniu = require("qiniu");
const accessKey = 'r9mfv61aHfhVtSntEMu038-WufT9yp9QEslZri3p';
const secretKey = 'HqyY11KlZFH9bk44y75rgOcyc6ZI_sC1OxPq4RNJ';
const bucket = 'firebase-dream';

exports.qiniuUpToken = functions.https.onRequest((req, res) => {
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    
    //自定义凭证有效期
    var options = {
      scope: bucket,
      expires: 12*3600 // 12小时
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    console.log('生成上传密钥: ' + uploadToken);
    res.status(200).send({token: uploadToken});
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
