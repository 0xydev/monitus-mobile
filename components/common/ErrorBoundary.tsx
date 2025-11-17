import React, { Component, ErrorInfo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-background items-center justify-center p-6">
          <View className="bg-card p-6 rounded-xl border border-border w-full max-w-md">
            <View className="items-center mb-4">
              <View className="bg-destructive/10 p-4 rounded-full mb-3">
                <AlertTriangle size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-foreground text-center">
                Something went wrong
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-2">
                An unexpected error occurred. Please try again.
              </Text>
            </View>

            {__DEV__ && this.state.error && (
              <ScrollView className="bg-muted p-3 rounded-lg max-h-40 mb-4">
                <Text className="text-xs font-mono text-destructive">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text className="text-xs font-mono text-muted-foreground mt-2">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <Pressable
              onPress={this.handleReset}
              className="bg-primary py-3 rounded-lg flex-row items-center justify-center active:opacity-80"
            >
              <RefreshCw size={18} color="white" />
              <Text className="text-primary-foreground font-medium ml-2">
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
