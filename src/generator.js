module.exports.generateKey = function(keyLength) {
    var key = '';
    var options = 'abcdefghijklmnopqrstuvwxyz1234567890';

    for (var i = 0; i < keyLength; i++) {
        key += options[Math.floor(Math.random() * options.length)];
    }

    return key;
}
