import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from 'src/notes/entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private notesRepository: Repository<Note>,
  ) {}
  async getNotes(): Promise<Note[]> {
    return await this.notesRepository.find();
  }

  async findOneNote(id: number): Promise<Note> {
    return await this.notesRepository.findOne({ where: { id: id } });
  }

  async createNote(note: CreateNoteDto) {
    try {
      console.log('sjjsss', note);

      return await this.notesRepository.save(note);
    } catch (error) {
      console.log(error);
    }
  }

  async remove(id: number): Promise<void> {
    await this.notesRepository.delete(id);
  }

  async editNote(id: number, note: Note): Promise<Note> {
    const editedNote = await this.notesRepository.findOne({
      where: { id: id },
    });
    if (!editedNote) {
      throw new NotFoundException('Note is not found');
    }
    editedNote.description = note.description;
    editedNote.title = note.title;
    await editedNote.save();
    return editedNote;
  }
}
