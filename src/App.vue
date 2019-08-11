<template>
	<div id="app">
		<div id="nav">
			<router-link to="/">Home</router-link>|
			<router-link to="/settings">Settings</router-link>
		</div>
		<router-view />
	</div>
</template>

<style lang="scss">
#app {
	font-family: 'Roboto', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}
#nav {
	padding: 30px;
	a {
		font-weight: bold;
		color: #2c3e50;
		&.router-link-exact-active {
			color: #42b983;
		}
	}
}

/* CSS */
#app,
body {
	width: 100%;
	height: 100%;
	background-color: #333333;
	color: white;
}
html {
	height: calc(100% - 10px);
}

body,
html {
	margin: 0;
}

// button {
// 	display: inline-block;
// 	border-width: 0;
// 	outline: none;
// 	border-radius: 2px;
// 	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);

//
// 	color: #ecf0f1;

// 	cursor: pointer;

// 	transition: background-color 0.3s;
// }

.btn {
	font-family: 'Roboto', sans-serif;

	background: transparent;
	color: white;
	border: none;
	outline: none;
	cursor: pointer;

	&.primary {
		background-color: #1976d2;
		border-radius: 2px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}
	&.secondary {
		background-color: white;
		color: #333333;
		border-radius: 2px;
		box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
		&.outline {
			color: rgba(255, 255, 255, 0.8);
			background: transparent;

		}
	}
}


li {
	list-style-type: none;
}
</style>
