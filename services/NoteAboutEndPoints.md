# Note About End Points
If there is an aggrigation relatioship between 2 resources the end point have an
anchore on the owner for example:
```
department has professors 
```
Then to access professors in department the end point will accept

```
METHOD http://domain/departmentId/professors
```
To CRUD professor in departemnt `departmentId`