package orm

import (
	"context"
	"time"

	"chords.com/api/internal/logger"
	gormLogger "gorm.io/gorm/logger"
)

type GormLogger struct{}

func (l GormLogger) LogMode(LogLevel gormLogger.LogLevel) gormLogger.Interface {
	return l
}
func (l GormLogger) Info(ctx context.Context, template string, args ...interface{}) {
	logger.GetLogger(ctx).Infof(template, args)
}
func (l GormLogger) Warn(ctx context.Context, template string, args ...interface{}) {
	logger.GetLogger(ctx).Warnf(template, args)
}
func (l GormLogger) Error(ctx context.Context, template string, args ...interface{}) {
	logger.GetLogger(ctx).Errorf(template, args)
}
func (l GormLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	sql, rowsAffected := fc()
	duration := time.Since(begin).String()
	if err == nil {
		logger.GetLogger(ctx).Debugf("trace duration %s, rows affected %d, sql: %s", duration, rowsAffected, sql)
	} else {
		logger.GetLogger(ctx).Errorf("trace duration %s, rows affected %d, sql: %s, error: %v", duration, rowsAffected, sql, err)
	}
}
