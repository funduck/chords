package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

var runtime_viper *viper.Viper

func Init() {
	if runtime_viper != nil {
		return
	}
	runtime_viper = viper.New()
	runtime_viper.SetConfigName("api")  // name of config file (without extension)
	runtime_viper.SetConfigType("json") // or "json", "toml", etc.
	runtime_viper.AddConfigPath(".")    // path to look for the config file in

	// Enable automatic key mapping
	runtime_viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	runtime_viper.AutomaticEnv()

	if err := runtime_viper.ReadInConfig(); err != nil {
		panic(fmt.Errorf("fatal error config file: %w", err))
	}

	// Debug: Print all keys that Viper found
	fmt.Printf("All Viper keys: %v\n", runtime_viper.AllKeys())
}

func Unmarshal(config interface{}) error {
	Init()
	if runtime_viper == nil {
		return fmt.Errorf("runtime_viper is not initialized, call Init() first")
	}
	return runtime_viper.Unmarshal(config)
}
