import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { ApiTags } from '@nestjs/swagger';
import { Note } from 'src/notes/entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotesService } from './notes.service';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @ApiTags('Get All notes')
  @Get()
  findAll() {
    return this.notesService.getNotes();
  }

  @ApiTags('Get Notes By ID')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id) {
    return this.notesService.findOneNote(id);
  }

  @ApiTags('Create a note')
  @Post()
  create(@Body() note: CreateNoteDto) {
    console.log('boddddddyyyyyyyyy', note);
    return this.notesService.createNote(note);
  }

  @ApiTags('Update a note by Id')
  @Patch(':id')
  async editNote(@Body() note: Note, @Param('id') id: number): Promise<Note> {
    const noteEdited = await this.notesService.editNote(id, note);
    return noteEdited;
  }

  @ApiTags('Delete a note by Id')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id) {
    this.notesService.remove(id);
  }
}
