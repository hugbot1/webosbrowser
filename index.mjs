import createServer from '@tomphttp/bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const bare = createServer('/bare/');
const serve = new nodeStatic.Server('static/');

const server = http.createServer();
var realm = 'AboutBrowser';
function authenticationStatus(resp) {
	resp.setHeader('WWW-Authenticate', 'Basic realm="' + realm + '"')
	resp.writeHead(401, 'Auth is needed', { 'WWW-Authenticate': 'Basic realm="' + realm + '"' })
	resp.end();
};

var users = [
	["frogOS", "frogOS"]
]

server.on('request', (req, res) => {
	res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
	res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
	// res.setHeader('Access-Control-Allow-Origin', '*')
	if (req.url.includes(".well-known/acme-challenge")) {
		serve.serve(req, res);
		return;
	}
	if (bare.shouldRoute(req)) {
		bare.routeRequest(req, res);
		return;
	}
	// var authentication, loginInfo;
	// if (typeof req.signedCookies != 'undefined' && req.signedCookies.signedIn === 'yes') {
	serve.serve(req, res);
	return;
	// }
	// if (!req.headers.authorization) {
	// 	authenticationStatus(res);
	// 	return;
	// }
	authentication = req.headers.authorization.replace(/^Basic/, '');
	authentication = (new Buffer.from(authentication, 'base64')).toString('utf8');
	loginInfo = authentication.split(':');
	var isLoggedIn = false;
	for (const user of users) {
		isLoggedIn = user[0] === loginInfo[0] && user[1] === loginInfo[1]
		if (isLoggedIn) {
			break;
		}
	}
	if (isLoggedIn) {
		if (typeof req.signedCookies != 'undefined' && typeof req.signedCookies.signedIn == 'undefined') {
			res.setHeader("Set-Cookie", "signedIn=yes Max-Age=86400");
		}
		serve.serve(req, res);
	} else {
		authenticationStatus(res);
	}
});

server.on('upgrade', (req, socket, head) => {
	if (bare.shouldRoute(req, socket, head)) {
		bare.routeUpgrade(req, socket, head);
	} else {
		socket.end();
	}
});

server.listen({
	port: process.env.PORT || 8080,
});
