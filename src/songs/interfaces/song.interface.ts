
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

// export interface ISong {
//   id: ID,
//   code: string,
//   title: string,
//   musicalNote: TNote | string,
//   paragraphs: IParagraph[] | string,
//   chorus: IChoir[],
// }


export interface ISong {
  id?: string;
  num_song: string;
  title: string;
  description: string;
  musicalNote: string;
  paragraphs: string[] | string;
  chorus: string;
}