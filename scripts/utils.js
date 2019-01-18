window.Utils = new class{
	
	triggerCustomEvent( target, event_name, data ){
		var event = new CustomEvent( event_name, data ? {detail: data} : undefined );
		target.dispatchEvent(event);
	}

}