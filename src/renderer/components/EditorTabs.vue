<template>
	<div id="wrapper">
		<vue-tabs>
			<v-tab title="2da Editor">
				Gonna put the 2da editor here!
			</v-tab>
		</vue-tabs>
	</div>
</template>

<script>

const electron = require('electron')
const fs = require('fs');

const dialog = electron.remote.dialog;
const app = electron.remote.app;
import path from 'path'

import {VueTabs, VTab} from 'vue-nav-tabs'
import 'vue-nav-tabs/themes/vue-tabs.css'

export default {
	name: 'editor-tabs',
	components: {
		VueTabs,
		VTab
	},
	methods: {

	},
}
</script>

<style>

</style>
