
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface PaginationInput {
    skip?: Nullable<number>;
    take?: Nullable<number>;
}

export interface VehicleType {
    typeId: number;
    typeName: string;
}

export interface Make {
    makeId: number;
    makeName: string;
    vehicleTypes: VehicleType[];
}

export interface MakesResult {
    total: number;
    items: Make[];
}

export interface IQuery {
    makes(paginationInput?: Nullable<PaginationInput>, actualize?: Nullable<boolean>): MakesResult | Promise<MakesResult>;
}

type Nullable<T> = T | null;
