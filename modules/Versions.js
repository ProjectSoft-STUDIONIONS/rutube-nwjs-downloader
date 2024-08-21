module.exports = function(grunt) {
	const fs = require("fs");
	const path = require("path");
	
	

	grunt.registerMultiTask('version_edit', 'Version Update YourRadio Lite', async function() {
		var done = this.async();
		const pkg = this.options().pkg;
		//grunt.file.write("version.iss", `#define RadioAppVersion "${pkg.version}"`);
		let versApp = grunt.file.readJSON('application/package.json');
		versApp.version = pkg.version;
		//versApp.buildDate = grunt.template.date(new Date().getTime(), 'dd mmmm yyyy HH:ss:MM');
		versApp.comments = pkg.comments;
		versApp.description = pkg.description;
		let str = JSON.stringify(versApp, null, "\t");
		//grunt.file.copy("LICENSE", "application/LICENSE");
		grunt.file.write("application/package.json", `${str}`);
		done();
	});
};