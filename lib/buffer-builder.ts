import {Command} from './command';
import {MutableBuffer} from 'mutable-buffer';

export default class BufferBuilder {

  private buffer:MutableBuffer;

  constructor() {
    this.buffer = new MutableBuffer();
    this.resetCharacterSize();
    this.resetCharacterCodeTable();
  }

  public resetCharacterCodeTable():BufferBuilder {
    this.buffer.write(Command.ESC_t(0))
    return this;
  }

  public setCharacterSize(width:number = 0, height:number = 0):BufferBuilder {
    let size = (width << 4) + height;
    this.buffer.write(Command.GS_exclamation(size))
    return this;
  }

  public resetCharacterSize():BufferBuilder {
    this.buffer.write(Command.GS_exclamation(0))
    return this;
  }

  public startCompressedCharacter():BufferBuilder {
    this.buffer.write(Command.ESC_M(1))
    return this;
  }

  public endCompressedCharacter():BufferBuilder {
    this.buffer.write(Command.ESC_M(0))
    return this;
  }

  public startBold():BufferBuilder {
    this.buffer.write(Command.ESC_E(1));
    return this;
  }

  public endBold():BufferBuilder {
    this.buffer.write(Command.ESC_E(0));
    return this;
  }

  public startUnderline(underlineMode:UNDERLINE_MODE = UNDERLINE_MODE.TWO_POINTS_OF_COARSE):BufferBuilder {
    this.buffer.write(Command.ESC_minus(underlineMode));
    return this;
  }

  public endUnderline():BufferBuilder {
    this.buffer.write(Command.ESC_minus(48));
    return this;
  }

  public align(alignment:ALIGNMENT):BufferBuilder {
    this.buffer.write(Command.ESC_a(alignment));
    return this;
  }

  public resetAlign():BufferBuilder {
    return this.align(ALIGNMENT.LEFT);
  }

  public startWhiteMode():BufferBuilder {
    this.buffer.write(Command.GS_B(1));
    return this;
  }

  public endWhiteMode():BufferBuilder {
    this.buffer.write(Command.GS_B(0));
    return this;
  }

  public startReverseMode():BufferBuilder {
    this.buffer.write(Command.ESC_rev(1));
    return this;
  }

  public endReverseMode():BufferBuilder {
    this.buffer.write(Command.ESC_rev(0));
    return this;
  }

  public printBarcode(data:string, barcodeSystem:BARCODE_SYSTEM, width:BARCODE_WIDTH = BARCODE_WIDTH.DOT_375, height:number = 162, labelFont:BARCODE_LABEL_FONT = BARCODE_LABEL_FONT.FONT_A, labelPosition:BARCODE_LABEL_POSITION = BARCODE_LABEL_POSITION.BOTTOM, alignment:ALIGNMENT = ALIGNMENT.CENTER, leftSpacing:number = 0):BufferBuilder {
    this.align(alignment); //align
    this.buffer.write(Command.GS_w(width)); // width
    this.buffer.write(Command.GS_h(height)); // height
    this.buffer.write(Command.GS_x(leftSpacing)); // left spacing
    this.buffer.write(Command.GS_f(labelFont)); // HRI font
    this.buffer.write(Command.GS_H(labelPosition)); // HRI font
    this.buffer.write(Command.GS_K(barcodeSystem, data.length)); // data is a string in UTF-8
    this.buffer.write(data);
    this.resetAlign();
    return this;
  }

  public printQRcode(data:string, version:number = 1, errorCorrectionLevel:QR_EC_LEVEL = QR_EC_LEVEL.H, componentTypes:number = 8, alignment:ALIGNMENT = ALIGNMENT.CENTER):BufferBuilder {
    this.align(alignment); //align
    this.buffer.write(Command.ESC_Z(version, errorCorrectionLevel, componentTypes));
    this.buffer.writeUInt16LE(data.length); // data is a string in UTF-8
    this.buffer.write(data);
    this.resetAlign();
    return this;
  }

  public printBitmap(image:number[], width:number, height:number, scale:BITMAP_SCALE = BITMAP_SCALE.NORMAL):BufferBuilder {
    return this;
  }

  public printText(text:string):BufferBuilder {
    this.buffer.write(text, 'ascii');
    return this;
  }

  public printTextLine(text:string):BufferBuilder {
    this.buffer.write(text);
    this.buffer.breakLine();
    return this;
  }

  public breakLine(lines:number = 0):BufferBuilder {
    this.buffer.write(Command.ESC_d(lines));
    return this;
  }

  public lineFeed():BufferBuilder {
    this.buffer.write(Command.LF);
    return this;
  }

  public build():number[] {
    this.lineFeed();
    this.buffer.write(Command.ESC_init);
    return this.buffer.flush();
  }

}

export enum UNDERLINE_MODE {
  ONE_POINT_OF_COARSE  = 49,
  TWO_POINTS_OF_COARSE = 50
}

export enum ALIGNMENT {
  LEFT   = 48,
  CENTER = 49,
  RIGHT  = 50
}

export enum BARCODE_SYSTEM {
  UPC_A    = 65,
  UPC_E    = 66,
  EAN_13   = 67,
  EAN_8    = 68,
  CODE_39  = 69,
  ITF      = 70,
  CODABAR  = 71,
  CODE_93  = 72,
  CODE_128 = 73
}

export enum BARCODE_WIDTH {
  DOT_250 = 2,
  DOT_375 = 3,
  DOT_560 = 4,
  DOT_625 = 5,
  DOT_750 = 6
}

export enum BARCODE_LABEL_FONT {
  FONT_A = 48,
  FONT_B = 49
}

export enum BARCODE_LABEL_POSITION {
  NOT_PRINT    = 48,
  ABOVE        = 49,
  BOTTOM       = 50,
  ABOVE_BOTTOM = 51
}

export enum QR_EC_LEVEL {
  L = 0,
  M = 1,
  Q = 2,
  H = 3
}

export enum BITMAP_SCALE {
  NORMAL        = 48,
  DOUBLE_WIDTH  = 49,
  DOUBLE_HEIGHT = 50,
  FOUR_TIMES    = 51
}