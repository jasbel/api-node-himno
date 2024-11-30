
export type ID = string;
export type TNote = '_' | 'G|Sol' | 'A|La' | 'C|Do' | 'D|Re' | 'E|Mi' | 'B|Si' | 'F|Fa' | 'F#|Fa#' | 'C/D|Do-Re';

// Interface for Song matches your specification
export interface IParagraph {
  id: ID;
  paragraph: string;
  chorusPos: [positionOrId: number | ID, repeat?: number][];
}

export interface IChoir {
  id: ID;
  choir: string,
}

export interface ISongCreate {
  code: string,
  title: string,
  musicalNote: TNote | string,
  paragraphs: IParagraph[] | string,
  chorus: IChoir[],
}

export interface ISong extends ISongCreate {
  id: ID
}
