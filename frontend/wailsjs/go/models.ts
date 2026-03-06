export namespace config {
	
	export class Config {
	    openai_api_key: string;
	    openai_model: string;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.openai_api_key = source["openai_api_key"];
	        this.openai_model = source["openai_model"];
	    }
	}

}

export namespace generator {
	
	export class AlbumConcept {
	    idea: string;
	    title: string;
	    genre: string;
	    mood: string;
	    trackCount: number;
	    description: string;
	    language: string;
	
	    static createFrom(source: any = {}) {
	        return new AlbumConcept(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.idea = source["idea"];
	        this.title = source["title"];
	        this.genre = source["genre"];
	        this.mood = source["mood"];
	        this.trackCount = source["trackCount"];
	        this.description = source["description"];
	        this.language = source["language"];
	    }
	}
	export class AlbumInput {
	    idea: string;
	    trackCount: number;
	    language: string;
	
	    static createFrom(source: any = {}) {
	        return new AlbumInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.idea = source["idea"];
	        this.trackCount = source["trackCount"];
	        this.language = source["language"];
	    }
	}
	export class ImagePromptResult {
	    prompt: string;
	
	    static createFrom(source: any = {}) {
	        return new ImagePromptResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.prompt = source["prompt"];
	    }
	}
	export class LyricsResult {
	    trackNumber: number;
	    trackTitle: string;
	    lyrics: string;
	
	    static createFrom(source: any = {}) {
	        return new LyricsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.trackNumber = source["trackNumber"];
	        this.trackTitle = source["trackTitle"];
	        this.lyrics = source["lyrics"];
	    }
	}
	export class Track {
	    number: number;
	    title: string;
	    genre: string;
	    mood: string;
	    bpm: string;
	    key: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new Track(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.title = source["title"];
	        this.genre = source["genre"];
	        this.mood = source["mood"];
	        this.bpm = source["bpm"];
	        this.key = source["key"];
	        this.notes = source["notes"];
	    }
	}
	export class SetlistResult {
	    albumTitle: string;
	    tracks: Track[];
	
	    static createFrom(source: any = {}) {
	        return new SetlistResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.albumTitle = source["albumTitle"];
	        this.tracks = this.convertValues(source["tracks"], Track);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SunoPromptResult {
	    trackNumber: number;
	    trackTitle: string;
	    stylePrompt: string;
	    lyricsPrompt: string;
	
	    static createFrom(source: any = {}) {
	        return new SunoPromptResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.trackNumber = source["trackNumber"];
	        this.trackTitle = source["trackTitle"];
	        this.stylePrompt = source["stylePrompt"];
	        this.lyricsPrompt = source["lyricsPrompt"];
	    }
	}

}

export namespace license {
	
	export class LicenseInfo {
	    valid: boolean;
	    expiresAt: string;
	    daysLeft: number;
	
	    static createFrom(source: any = {}) {
	        return new LicenseInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.valid = source["valid"];
	        this.expiresAt = source["expiresAt"];
	        this.daysLeft = source["daysLeft"];
	    }
	}
	export class TrialStatus {
	    active: boolean;
	    daysLeft: number;
	    expired: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TrialStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.active = source["active"];
	        this.daysLeft = source["daysLeft"];
	        this.expired = source["expired"];
	    }
	}
	export class AppStatus {
	    licensed: boolean;
	    trial?: TrialStatus;
	    license?: LicenseInfo;
	    hwid: string;
	    shortHwid: string;
	
	    static createFrom(source: any = {}) {
	        return new AppStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.licensed = source["licensed"];
	        this.trial = this.convertValues(source["trial"], TrialStatus);
	        this.license = this.convertValues(source["license"], LicenseInfo);
	        this.hwid = source["hwid"];
	        this.shortHwid = source["shortHwid"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

