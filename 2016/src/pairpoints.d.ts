export interface pPoints {
    area: string;
    area_id:number;
    estado_id:number;
    estado: string;
    e_year:number;
    e_year_id:number;
    grado: string;
    grado_id:number;
    s_year: number;
    s_year_id:number;
    x:number;
    y:number;
}

export interface pCaptions {
    leg: string;
    x: number;
}

export interface Country {
    name: string;
    becarios: Array<number>;
    grados: Array<number>;
    areas: Array<number>;
    xGrados: Array<Array<number>>;
    xAreas: Array<Array<number>>;
}