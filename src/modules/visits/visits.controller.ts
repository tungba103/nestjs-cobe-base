import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  Delete,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims } from '@n-decorators';
import { FilterVisitDto } from './dto/filter-visit.dto';

@Controller('visits')
@ApiTags('Visit')
@AuthClaims()
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(@Req() req, @Body() createVisitDto: CreateVisitDto) {
    const { id, name } = req.user;
    return this.visitsService.create({ id, name }, createVisitDto);
  }

  @Get()
  findAll(@Query() filter?: FilterVisitDto) {
    return this.visitsService.getListVisits(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitsService.updateVisitInfo(+id, updateVisitDto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.visitsService.cancelVisit(+id);
  }
}
