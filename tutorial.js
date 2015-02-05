var crypto = require('crypto');
var clear = require('cli-clear');
var colors = require('colors/safe');

var group = 'modp14';
var aliceDH = crypto.getDiffieHellman(group);
var bobDH = crypto.getDiffieHellman(group);

aliceDH.generateKeys();
bobDH.generateKeys();

var aliceSecret = aliceDH.computeSecret(bobDH.getPublicKey(), null, 'hex');
var bobSecret = bobDH.computeSecret(aliceDH.getPublicKey(), null, 'hex');

var eveDH = crypto.getDiffieHellman(group);
eveDH.generateKeys();
var eveSecret = eveDH.computeSecret(aliceDH.getPublicKey(), null, 'hex');

//console.log(crypto.getCiphers());
var cypher = 'aes-256-ctr';
var hash = 'sha256';
var aliceHashedSecret = crypto.createHash(hash).update(aliceSecret).digest('binary');
var aliceIV = crypto.randomBytes(128);
var aliceCypher = crypto.createCipher(cypher, aliceHashedSecret, aliceIV);

var cypherText = aliceCypher.update('I love you!');

//var bobIV = cypherText.slice(-16);
//var bobCypher = crypto.createDecipher(alg, bobSecret, bobIV);
var bobHashedSecret = crypto.createHash(hash).update(bobSecret).digest('binary');
var bobCypher = crypto.createDecipher(cypher, bobHashedSecret);

var plainText = bobCypher.update(cypherText).toString();
//console.log(plainText);

var eveCypher = crypto.createDecipher(cypher, eveSecret);
var eveText = eveCypher.update(cypherText).toString();
//console.log(eveText);

var alice = colors.magenta('Alice');
var bob = colors.cyan('Bob');
var eve = colors.red('Eve');

var slides = [
  function () {
    console.log('Meet ' + alice + '.');
  }, 2000,
  function () {
    console.log('Meet ' + bob + '.');
  }, 2000,
  function () {
    console.log('Meet ' + eve + '.');
  }, 2000,
  function () {
    console.log();
    console.log(alice + ' wants to send ' + bob + ' a secret message.');
    console.log(alice + ' would not like ' + eve + ' to view the message.\n');
    console.log('Assume ' + eve + ' intercepts everything ' + alice + ' and ' + bob + ' try to share with each other.');
  }, 10000,
  function () {
    clear();
    console.log(alice + ' chooses a modular exponential key group, such as modp14,');
    console.log('then creates a public and private key pair.');
    console.log();
    console.log(colors.yellow('var group = "modp14";'));
    console.log(colors.yellow('var aliceDH = crypto.getDiffieHellman(group);'));
    console.log(colors.yellow('aliceDH.generateKeys();'));
    console.log();
  }, 10000,
  function () {
    console.log('A modular exponential key group is simply a "sufficiently large" prime number.');
    console.log('paired with a generator (specific number) defined in RFC2412 or RFC3526.');
  }, 10000,
  function () {
    console.log();
    console.log('The public key is meant to be shared, it is ok for ' + eve + ' to know the public key.');
    console.log('The private key must not ever be shared, even with the person communicating to.');
  }, 10000,
  function () {
    clear();
    console.log(alice + ' then shares her public key and group with ' + bob + '.');
    console.log();
    console.log('Public key:\n', aliceDH.getPublicKey(), '\n');
    console.log('Group:\n', group);
  }, 10000,
  function () {
    console.log();
    console.log(bob + ' now creates a public and private key pair with the same group as ' + alice + '.');
    console.log();
    console.log(colors.yellow('var bobDH = crypto.getDiffieHellman(group);'));
    console.log(colors.yellow('bobDH.generateKeys();'));
  }, 10000,
  function () {
    console.log();
    console.log(bob + ' shares his public key with ' + alice + '.', '\n');
    console.log('Public key:\n', bobDH.getPublicKey());
  }, 10000,
  function () {
    clear();
    console.log(alice + ' and ' + bob + ' now compute a shared secret.\n')
    console.log(alice + ':');
    console.log(colors.yellow('var aliceSecret = aliceDH.computeSecret(bobDH.getPublicKey(), null, "hex");'));
    console.log('\n' + bob + ':');
    console.log(colors.yellow('var bobSecret = bobDH.computeSecret(aliceDH.getPublicKey(), null, "hex");\n'));
  }, 10000,
  function () {
    console.log(alice + ' and ' + bob + ' have now each derived a shared secret from each others\' public keys.');
    console.log(alice + '\'s secret === ' + bob + '\'s secret // ' + (aliceSecret === bobSecret));
  }, 10000,
  function () {
    clear();
    console.log('Meanwhile, ' + eve + ' has intercepted ' + alice + ' and ' +
                bob + '\'s public keys and group.\n');
    console.log(eve + ' tries to compute the same secret.\n');
    console.log(colors.yellow('var eveDH = crypto.getDiffieHellman(group);'));
    console.log(colors.yellow('eveDH.generateKeys();'));
    console.log(colors.yellow('var eveSecret = eveDH.computeSecret(aliceDH.getPublicKeys(), null, hex);\n'));
  }, 12000,
  function () {
    console.log(eve + '\'s secret === ' + alice + '\'s secret // ' +
                (eveSecret === aliceSecret));
    console.log('\nThis is because ' + alice + '\'s secret is derived from ' +
                alice + ' and ' + bob + '\'s private keys,');
    console.log('which ' + eve + ' does not have.');
    console.log(eve + ' may not realize this until later.');
  }, 10000,
  function () {
    clear();
    console.log('That was asymmetric encryption; using different keys.');
    console.log('The shared secret may be used now in symmetric encryption; same keys.');
  }, 10000,
  function () {
    clear();
    console.log(alice + ' creates a symmetric block cypher using her favorite algorithm,');
    console.log('a hash of their shared secret as a key, and random bytes as an');
    console.log('initialization vector.\n');
    console.log(colors.yellow('var cypher = "aes-256-ctr";'));
    console.log(colors.yellow('var hash = "sha256";'));
    console.log(colors.yellow('var aliceIV = crypto.randomBytes(128);'));
    // Hashing prevents weak bits.
    // http://en.wikipedia.org/wiki/Elliptic_curve_Diffie%E2%80%93Hellman
    console.log(colors.yellow('var aliceHashedSecret = crypto.createHash(hash).update(aliceSecret).digest("binary");'));
    console.log(colors.yellow('var aliceCypher = crypto.createCypher(alg, aliceHashedSecret, aliceIV)'));
  }, 15000,
  function () {
    clear();
    console.log(alice + ' then uses her cypher to encrypt her message to ' + bob + '.\n');
    console.log(colors.yellow('var cypherText = aliceCypher.update("...");\n'));
  }, 10000,
  function () {
    console.log(alice + ' then sends the cypherText, cypher, and hash to ' + bob + '.\n');
    console.log('cypherText:\n', cypherText);
    console.log('cypher:\n', cypher);
    console.log('hash:\n', hash, '\n');
  }, 10000,
  function () {
    console.log(bob + ' now constructs a symmetric block cypher using the algorithm from');
    //console.log(alice + ', their shared secret, and the last 128b of the cyphertext as the IV.\n');
    console.log(alice + ', and a hash of their shared secret.\n');
    //console.log(colors.yellow('var bobIV = cypherText.slice(-16);'));
    //console.log(colors.yellow('var bobCypher = crypto.createDecipher(alg, bobSecret, bobIV);\n'));
    console.log(colors.yellow('var bobHashedSecret = crypto.createHash(hash).update(bobSecret).digest("binary");'));
    console.log(colors.yellow('var bobCypher = crypto.createDecipher(alg, bobHashedSecret);\n'));
  }, 10000,
  function () {
    console.log(bob + ' now decyphers the encypted message (cypher text) from ' + alice + '.\n');
    console.log(colors.yellow('var plainText = bobCypher.update(cypherText);'));
    console.log(colors.yellow('console.log(plainText);\n'));
    console.log(plainText.toString());
  }, 10000,
  function () {
    clear();
    console.log(eve + ' has intercepted the cyphertext, cypher, hash, and tries to decrypt it.\n');
    console.log(colors.yellow('var eveHashedSecret = crypto.createHash(hash).update(eveSecret).digest("binary");'));
    console.log(colors.yellow('var eveCypher = crypto.createDecipher(alg, eveSecret);'));
    console.log(colors.yellow('console.log(eveCypher.update(cypherText).toString());\n'));
    console.log(eveText);
    console.log('\nHere\'s where ' + eve + ' realizes her secret is not correct.');
  }, 10000,
  function () {
    clear();
    console.log('This prevents passive eavesdropping, but not active MITM attacks.\n');
    console.log('How does ' + alice + ' know that the message supposedly from ' + bob);
    console.log('actually was from ' + bob + ', not ' + eve + ' posing as ' + bob + '???');
  }, 7000
];

(function loop () {
  var fn = slides.shift();
  var wait = slides.shift();
  if (typeof fn !== 'function' || typeof wait !== 'number') {
    throw new Error('oops slide was not fn, number!');
  }
  fn();
  if (slides.length === 0) return;
  setTimeout(loop, wait);
})();

