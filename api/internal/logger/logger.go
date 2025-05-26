package logger

import (
	"context"
	"fmt"
	"strings"

	"chords.com/api/internal/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type LoggerType = *zap.SugaredLogger

var instanceRefs map[string]*zap.SugaredLogger = make(map[string]*zap.SugaredLogger)

// Allows to create a new logger with a specific environment and package name
// LOGGER_LEVEL is used as a default log level
// If packageName is provided, it will try to get the log level from the environment variable with the name of the package in uppercase
func NewLogger(packageName string) *zap.SugaredLogger {
	if instance, ok := instanceRefs[packageName]; ok {
		return instance
	}

	var logger *zap.Logger
	conf := config.New()

	if Env(conf.LoggerEnv) != EnvProd {
		cfg := zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		levelStr := conf.LoggerLevel
		var ok bool
		if packageName != "" {
			if levelStr, ok = conf.LoggerLevels[strings.ToLower(packageName)]; ok {
				fmt.Printf("Logger level for %s not found, using global %s level\n", packageName, levelStr)
			} else {
				fmt.Printf("Logger level for %s %s level\n", packageName, levelStr)
			}
		}
		levelStr = strings.ToLower(levelStr)
		switch levelStr {
		case "debug":
			cfg.Level = zap.NewAtomicLevelAt(zapcore.DebugLevel)
		case "info":
			cfg.Level = zap.NewAtomicLevelAt(zapcore.InfoLevel)
		case "warn":
			cfg.Level = zap.NewAtomicLevelAt(zapcore.WarnLevel)
		case "error":
			cfg.Level = zap.NewAtomicLevelAt(zapcore.ErrorLevel)
		}

		logger, _ = cfg.Build()
	} else {
		logger, _ = zap.NewProduction()
	}
	defer logger.Sync()

	sugared := logger.Sugar()
	instanceRefs[packageName] = sugared

	return sugared
}

type Env string

const (
	EnvProd Env = "prod"
	EnvDev  Env = "dev"
)

func New() *zap.SugaredLogger {
	return NewLogger("")
}

func NewForModule(packageName string) *zap.SugaredLogger {
	return NewLogger(packageName)
}

type loggerKeyType string

const loggerKey loggerKeyType = "logger"

func SetLogger(ctx context.Context, logger LoggerType) context.Context {
	return context.WithValue(ctx, loggerKey, logger)
}

func GetLogger(ctx context.Context) LoggerType {
	if loggerDto := ctx.Value(loggerKey); loggerDto != nil {
		return loggerDto.(LoggerType)
	}
	return New()
}
