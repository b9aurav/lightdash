import { FieldType } from './field';
import { ResultValue } from './results';

export type PivotConfig = {
    pivotDimensions: string[];
    metricsAsRows: boolean;
    columnOrder?: string[];
    hiddenMetricFieldIds?: string[];
    summableMetricFieldIds?: string[];
    columnTotals?: boolean;
    rowTotals?: boolean;
};

type Field =
    | { type: FieldType.METRIC; fieldId?: undefined }
    | { type: FieldType.DIMENSION; fieldId: string };

type FieldValue =
    | { type: 'value'; fieldId: string; value: ResultValue }
    | { type: 'label'; fieldId: string };

type TitleField = null | {
    fieldId: string;
    direction: 'index' | 'header';
};

type TotalField = null | {
    fieldId?: string;
};

type TotalValue = null | number;

type DataValue = null | ResultValue;

export type PivotData = {
    headerValueTypes: Field[];
    headerValues: FieldValue[][];

    indexValueTypes: Field[];
    indexValues: FieldValue[][];

    dataColumnCount: number;
    dataValues: DataValue[][];

    titleFields: TitleField[][];

    rowTotalFields?: TotalField[][];
    columnTotalFields?: TotalField[][];

    rowTotals?: TotalValue[][];
    columnTotals?: TotalValue[][];

    pivotConfig: PivotConfig;
};
