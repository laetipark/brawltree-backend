import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    select: false
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    select: false
  })
  updatedAt: Date;
}

export abstract class SoftDeleteEntity extends BaseEntity {
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    default: () => null,
    select: false
  })
  deletedAt: Date;
}
