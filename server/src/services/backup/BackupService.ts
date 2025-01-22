import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Logger } from '../../utils/logger';
import { NotificationService } from '../notification/NotificationService';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly s3: S3;
  
  constructor(private readonly notificationService: NotificationService) {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async performBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const backupFileName = `backup-${timestamp}.sql`;

      // データベースのダンプを作成
      await this.createDatabaseDump(backupFileName);

      // S3にバックアップをアップロード
      await this.uploadToS3(backupFileName);

      // 古いバックアップの削除
      await this.cleanupOldBackups();

      await this.notificationService.sendBackupNotification({
        status: 'SUCCESS',
        timestamp,
        fileName: backupFileName
      });

    } catch (error) {
      Logger.error('Backup failed:', error);
      await this.notificationService.sendBackupNotification({
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  async restoreFromBackup(backupFileName: string): Promise<void> {
    try {
      // S3からバックアップをダウンロード
      await this.downloadFromS3(backupFileName);

      // データベースの復元
      await this.restoreDatabase(backupFileName);

      await this.notificationService.sendRestoreNotification({
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        fileName: backupFileName
      });

    } catch (error) {
      Logger.error('Restore failed:', error);
      await this.notificationService.sendRestoreNotification({
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  private async createDatabaseDump(fileName: string): Promise<void> {
    const command = `pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F c -f ${fileName}`;
    await execAsync(command);
  }

  private async uploadToS3(fileName: string): Promise<void> {
    const fileContent = await fs.promises.readFile(fileName);
    await this.s3.putObject({
      Bucket: process.env.BACKUP_BUCKET,
      Key: fileName,
      Body: fileContent
    }).promise();
  }

  private async cleanupOldBackups(): Promise<void> {
    const response = await this.s3.listObjects({
      Bucket: process.env.BACKUP_BUCKET
    }).promise();

    const oldBackups = response.Contents
      .filter(obj => {
        const backupDate = new Date(obj.LastModified);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return backupDate < thirtyDaysAgo;
      })
      .map(obj => ({ Key: obj.Key }));

    if (oldBackups.length > 0) {
      await this.s3.deleteObjects({
        Bucket: process.env.BACKUP_BUCKET,
        Delete: { Objects: oldBackups }
      }).promise();
    }
  }
} 