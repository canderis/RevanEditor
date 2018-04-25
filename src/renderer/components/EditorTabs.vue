<template>
	<div id="wrapper">
		<p>
            Hello world!
        </p>
	</div>
</template>

<script>

const electron = require('electron')
const fs = require('fs');

const dialog = electron.remote.dialog;
const app = electron.remote.app;
import path from 'path'

export default {
	name: 'editor-tabs',
	methods: {

	},
}
</script>

<style>

</style>
