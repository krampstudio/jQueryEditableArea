module.exports = function(grunt){
	grunt.initConfig({
		pkg: '<json:package.json>',
        meta: {
            banner: '/**\n'+
					' * <%= pkg.name %> - v<%= pkg.version %> \n' +
					' * @author <%=pkg.author.name%> <<%=pkg.author.email%>>\n' +
					' * @license <%=pkg.licenses[0].url%>\n'+
                    ' */'
        },
		min : {
			dist : {
				src: ['src/jquery.editablearea.js', 'src/jquery.removeablearea.js'],
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
};
