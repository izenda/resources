copy package.json ..\.. /y
copy gulpfile.js ..\.. /y
copy tsconfig.json ..\.. /y
rmdir ..\..\node_modules /Q /S
del ..\..\package-lock.json /Q