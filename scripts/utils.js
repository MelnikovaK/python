window.Utils = new class{
	
	triggerCustomEvent( target, event_name, data ){
		var event = new CustomEvent( event_name, data ? {detail: data} : undefined );
		target.dispatchEvent(event);
	}

}

window.Utils.PI2 = Math.PI*2;
window.Utils.PI_HALF = Math.PI/2;
window.Utils.DEG2RAD = Math.PI/180;
window.Utils.RAD2DEG = 180/Math.PI;