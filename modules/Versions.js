module.exports = function(grunt) {
	const fs = require("fs");
	const path = require("path");
	
	

	grunt.registerMultiTask('version_edit', 'Version Update RuTube-DL', async function() {
		var done = this.async();
		const pkg = this.options().pkg;
		grunt.file.write("version.iss", `#define RuTubeDlAppVersion "${pkg.version}"`);
		let versApp = grunt.file.readJSON('application/package.json');
		versApp.version = pkg.version;
		versApp.comments = pkg.comments;
		versApp.description = pkg.description;
		let str = JSON.stringify(versApp, null, "\t");
		grunt.file.write("application/package.json", `${str}`);
		grunt.file.copy("LICENSE", "application/LICENSE");
		done();
	});
};