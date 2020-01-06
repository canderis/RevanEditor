/* SystemJS module definition */
declare var nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

interface Window {
  process: any;
  require: any;
}



declare module 'decode-dxt'{
	// class dxt {
	const dxt1 = 'dxt1';
	const dxt2 = 'dxt2';
	const dxt3 = 'dxt3';
	const dxt4 = 'dxt4';
	const dxt5 = 'dxt5';
	// 	static
	// }
	function dxt (dataview: DataView, width: number, height: number, dxt: string ): Uint8Array;


}

declare module 'jexcel' {
	function jexcel(el: HTMLElement, data: any): void;

	export = jexcel;
}
