module.exports = function(grunt){
	grunt.initConfig({
		pkg: '<json:package.json>',
        meta: {
            banner: '/**\n'+
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
					' * <%= pkg.name %> - v<%= pkg.version %> \n' +
					' * @author <%=pkg.author.name%> <<%=pkg.author.email%>>\n' +
					' * @license <%= _.pluck(pkg.licenses, "url").join(", ")\n'+
                    ' */'
        },
		min : {
			dist : {
				src: 'src/jquery.editablearea.js',
				dest: 'jquery.<%=pkg.name%>.min.js'
			}
		},
		concat : {
			dist : {
				src : [ '<banner>', 'jquery.<%=pkg.name%>.min.js'],
				dest: 'jquery.<%=pkg.name%>.min.js'
			}
		},
		qunit : {
			all : ['test/*.html']
		}
	});
    grunt.registerTask('default', 'min concat');
};
