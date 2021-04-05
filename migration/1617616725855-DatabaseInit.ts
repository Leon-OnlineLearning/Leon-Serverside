import {MigrationInterface, QueryRunner} from "typeorm";

export class DatabaseInit1617616725855 implements MigrationInterface {
    name = 'DatabaseInit1617616725855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `professor` DROP FOREIGN KEY `FK_7e281a085f2314de20f6a62fe41`");
        await queryRunner.query("ALTER TABLE `professor` CHANGE `password` `password` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `professor` CHANGE `departmentId` `departmentId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `lecture` DROP FOREIGN KEY `FK_89e61e55d5b02ea76363a3a55a6`");
        await queryRunner.query("ALTER TABLE `lecture` DROP FOREIGN KEY `FK_137552ffd78c2368c74ccf19de6`");
        await queryRunner.query("ALTER TABLE `lecture` CHANGE `courseId` `courseId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `lecture` CHANGE `professorId` `professorId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` DROP FOREIGN KEY `FK_e78ee3aed41d963a3a9fd4079c2`");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` DROP FOREIGN KEY `FK_52753ba2926a7e545d9827ba873`");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` CHANGE `studentId` `studentId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` CHANGE `lectureId` `lectureId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `student` DROP FOREIGN KEY `FK_5055e57181dc1d5ff6f4da7a98c`");
        await queryRunner.query("ALTER TABLE `student` CHANGE `password` `password` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `student` CHANGE `departmentId` `departmentId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `students_exams` DROP FOREIGN KEY `FK_ae4d89d9a5da2b3d43a65ae0b07`");
        await queryRunner.query("ALTER TABLE `students_exams` DROP FOREIGN KEY `FK_0c9ec9dd610ce25a3896ab580e0`");
        await queryRunner.query("ALTER TABLE `students_exams` CHANGE `studentId` `studentId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `students_exams` CHANGE `examId` `examId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `exam` DROP FOREIGN KEY `FK_e6b0d68b26f7847f2d46810df8f`");
        await queryRunner.query("ALTER TABLE `exam` DROP FOREIGN KEY `FK_d13e02e30e86bbf25e5e3e7bee8`");
        await queryRunner.query("ALTER TABLE `exam` CHANGE `courseId` `courseId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `exam` CHANGE `professorId` `professorId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `departments` DROP FOREIGN KEY `FK_16d3333406d0e7b64b95d51d22e`");
        await queryRunner.query("ALTER TABLE `departments` DROP FOREIGN KEY `FK_334b23b781f57a4113bd0eef86d`");
        await queryRunner.query("ALTER TABLE `departments` CHANGE `lecturesId` `lecturesId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `departments` CHANGE `examsId` `examsId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `course` DROP FOREIGN KEY `FK_254eaf1f4ac5c87bd1ebc2efce3`");
        await queryRunner.query("ALTER TABLE `course` CHANGE `departmentsId` `departmentsId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `admin` CHANGE `password` `password` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `professor` ADD CONSTRAINT `FK_7e281a085f2314de20f6a62fe41` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `lecture` ADD CONSTRAINT `FK_89e61e55d5b02ea76363a3a55a6` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `lecture` ADD CONSTRAINT `FK_137552ffd78c2368c74ccf19de6` FOREIGN KEY (`professorId`) REFERENCES `professor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` ADD CONSTRAINT `FK_e78ee3aed41d963a3a9fd4079c2` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` ADD CONSTRAINT `FK_52753ba2926a7e545d9827ba873` FOREIGN KEY (`lectureId`) REFERENCES `lecture`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `student` ADD CONSTRAINT `FK_5055e57181dc1d5ff6f4da7a98c` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `students_exams` ADD CONSTRAINT `FK_ae4d89d9a5da2b3d43a65ae0b07` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `students_exams` ADD CONSTRAINT `FK_0c9ec9dd610ce25a3896ab580e0` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `exam` ADD CONSTRAINT `FK_e6b0d68b26f7847f2d46810df8f` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `exam` ADD CONSTRAINT `FK_d13e02e30e86bbf25e5e3e7bee8` FOREIGN KEY (`professorId`) REFERENCES `professor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `departments` ADD CONSTRAINT `FK_16d3333406d0e7b64b95d51d22e` FOREIGN KEY (`lecturesId`) REFERENCES `lecture`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `departments` ADD CONSTRAINT `FK_334b23b781f57a4113bd0eef86d` FOREIGN KEY (`examsId`) REFERENCES `exam`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `course` ADD CONSTRAINT `FK_254eaf1f4ac5c87bd1ebc2efce3` FOREIGN KEY (`departmentsId`) REFERENCES `departments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `course` DROP FOREIGN KEY `FK_254eaf1f4ac5c87bd1ebc2efce3`");
        await queryRunner.query("ALTER TABLE `departments` DROP FOREIGN KEY `FK_334b23b781f57a4113bd0eef86d`");
        await queryRunner.query("ALTER TABLE `departments` DROP FOREIGN KEY `FK_16d3333406d0e7b64b95d51d22e`");
        await queryRunner.query("ALTER TABLE `exam` DROP FOREIGN KEY `FK_d13e02e30e86bbf25e5e3e7bee8`");
        await queryRunner.query("ALTER TABLE `exam` DROP FOREIGN KEY `FK_e6b0d68b26f7847f2d46810df8f`");
        await queryRunner.query("ALTER TABLE `students_exams` DROP FOREIGN KEY `FK_0c9ec9dd610ce25a3896ab580e0`");
        await queryRunner.query("ALTER TABLE `students_exams` DROP FOREIGN KEY `FK_ae4d89d9a5da2b3d43a65ae0b07`");
        await queryRunner.query("ALTER TABLE `student` DROP FOREIGN KEY `FK_5055e57181dc1d5ff6f4da7a98c`");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` DROP FOREIGN KEY `FK_52753ba2926a7e545d9827ba873`");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` DROP FOREIGN KEY `FK_e78ee3aed41d963a3a9fd4079c2`");
        await queryRunner.query("ALTER TABLE `lecture` DROP FOREIGN KEY `FK_137552ffd78c2368c74ccf19de6`");
        await queryRunner.query("ALTER TABLE `lecture` DROP FOREIGN KEY `FK_89e61e55d5b02ea76363a3a55a6`");
        await queryRunner.query("ALTER TABLE `professor` DROP FOREIGN KEY `FK_7e281a085f2314de20f6a62fe41`");
        await queryRunner.query("ALTER TABLE `admin` CHANGE `password` `password` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `course` CHANGE `departmentsId` `departmentsId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `course` ADD CONSTRAINT `FK_254eaf1f4ac5c87bd1ebc2efce3` FOREIGN KEY (`departmentsId`) REFERENCES `departments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `departments` CHANGE `examsId` `examsId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `departments` CHANGE `lecturesId` `lecturesId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `departments` ADD CONSTRAINT `FK_334b23b781f57a4113bd0eef86d` FOREIGN KEY (`examsId`) REFERENCES `exam`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `departments` ADD CONSTRAINT `FK_16d3333406d0e7b64b95d51d22e` FOREIGN KEY (`lecturesId`) REFERENCES `lecture`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `exam` CHANGE `professorId` `professorId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `exam` CHANGE `courseId` `courseId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `exam` ADD CONSTRAINT `FK_d13e02e30e86bbf25e5e3e7bee8` FOREIGN KEY (`professorId`) REFERENCES `professor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `exam` ADD CONSTRAINT `FK_e6b0d68b26f7847f2d46810df8f` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `students_exams` CHANGE `examId` `examId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `students_exams` CHANGE `studentId` `studentId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `students_exams` ADD CONSTRAINT `FK_0c9ec9dd610ce25a3896ab580e0` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `students_exams` ADD CONSTRAINT `FK_ae4d89d9a5da2b3d43a65ae0b07` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `student` CHANGE `departmentId` `departmentId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `student` CHANGE `password` `password` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `student` ADD CONSTRAINT `FK_5055e57181dc1d5ff6f4da7a98c` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` CHANGE `lectureId` `lectureId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` CHANGE `studentId` `studentId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` ADD CONSTRAINT `FK_52753ba2926a7e545d9827ba873` FOREIGN KEY (`lectureId`) REFERENCES `lecture`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `student_lecture_attendance` ADD CONSTRAINT `FK_e78ee3aed41d963a3a9fd4079c2` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `lecture` CHANGE `professorId` `professorId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `lecture` CHANGE `courseId` `courseId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `lecture` ADD CONSTRAINT `FK_137552ffd78c2368c74ccf19de6` FOREIGN KEY (`professorId`) REFERENCES `professor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `lecture` ADD CONSTRAINT `FK_89e61e55d5b02ea76363a3a55a6` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `professor` CHANGE `departmentId` `departmentId` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `professor` CHANGE `password` `password` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `professor` ADD CONSTRAINT `FK_7e281a085f2314de20f6a62fe41` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
