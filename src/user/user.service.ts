import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor() {}

  async create(data: CreateUserDTO) {
    data.password = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data,
    });
  }

  async list() {
    return this.prisma.user.findMany();
  }

  async showById(id: number) {
    await this.exists(id);

    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    { name, email, password, birthAt, role }: UpdatePutUserDTO,
  ) {
    await this.exists(id);
    password = await bcrypt.hash(password, 10);

    return this.prisma.user.update({
      data: {
        name,
        email,
        password,
        birthAt: birthAt ? new Date(birthAt) : null,
        role,
      },
      where: {
        id,
      },
    });
  }

  async updatePartial(
    id: number,
    { name, email, password, birthAt, role }: UpdatePatchUserDTO,
  ) {
    const data: any = {};

    await this.exists(id);

    if (name) {
      data.name = name;
    }

    if (email) {
      data.email = email;
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (role) {
      data.role = role;
    }
    if (birthAt) {
      data.birthAt = new Date(birthAt);
    }

    return this.prisma.user.update({
      data,
      where: {
        id,
      },
    });
  }

  async delete(id: number) {
    if (!(await this.showById(id))) {
      throw new NotFoundException(`O usuário com o id: ${id} não existe.`);
    }

    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async exists(id: number) {
    if (
      !(await this.prisma.user.count({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException(`O usuário com o id: ${id} não existe.`);
    }
  }
}
