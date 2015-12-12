# Housing Application Developer Guide

The University of Alabama Housing Scheduling & Notification Application was designed to simplify communication and event scheduling for univeristy housing-related training and professional development. This user manual covers the general use of the online administration interface and its corresponding functions.

## Installation
Requires node.js v4.0.0 or greater, MongoDB v3.0.4 or greater, and PostgreSQL v9.4 or greater. After installing, run:

	$ cd ./housing && npm install
	$ node setup
	
Step 1 installs all modules and dependencies required by the application. Step 2 runs the setup script to guide the user through the setup process.

### Optional

Initialize the database with test data by running:

	$ node setup initTestData

## Plans

	