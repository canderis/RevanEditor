import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

interface Directory {
	label: string;
	path: string;
}

interface State {
	directories: Directory[];
}

export default new Vuex.Store({
	state: {
		directories: [],
	} as State,
	mutations: {
		addDirectory(state: State, payload: {label: string, path: string}) {
			state.directories.push({label: payload.label, path: payload.path});
		}
	} as any,
	actions: {},
});
