package orm

import (
	"context"
	"errors"
	"time"

	"chords.com/api/internal/logger"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
)

type dbLogger struct {
	logger.Logger
}

func NewGormLogger() dbLogger {
	return dbLogger{
		Logger: logger.NewForModule("db"),
	}
}

func (l dbLogger) LogMode(LogLevel gormLogger.LogLevel) gormLogger.Interface {
	// We do not apply any specific log level handling here
	return l
}
func (l dbLogger) Info(ctx context.Context, template string, args ...interface{}) {
	l.Infof(template, args...)
}
func (l dbLogger) Warn(ctx context.Context, template string, args ...interface{}) {
	l.Warnf(template, args...)
}
func (l dbLogger) Error(ctx context.Context, template string, args ...interface{}) {
	l.Errorf(template, args...)
}
func (l dbLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	sql, rowsAffected := fc()
	duration := time.Since(begin).String()
	if err == nil {
		l.Debugf("trace duration %s, rows affected %d, sql: %s", duration, rowsAffected, sql)
	} else {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			l.Debugf("trace duration %s, rows affected %d, sql: %s, error: %v", duration, rowsAffected, sql, err)
			return
		}
		l.Errorf("trace duration %s, rows affected %d, sql: %s, error: %v", duration, rowsAffected, sql, err)
	}
}
