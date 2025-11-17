import { View, Text, Pressable, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { useTagStore } from '@/stores/tagStore';
import { Tag as TagIcon, Plus } from 'lucide-react-native';

interface TagSelectorProps {
  selectedTagId: string | null;
  onSelect: (tagId: string | null) => void;
  disabled?: boolean;
  onCreateTag?: () => void;
}

export function TagSelector({
  selectedTagId,
  onSelect,
  disabled = false,
  onCreateTag,
}: TagSelectorProps) {
  const { tags, fetchTags, isLoading } = useTagStore();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  if (isLoading) {
    return (
      <View>
        <Text className="text-sm text-muted-foreground mb-2">Category</Text>
        <View className="bg-muted/50 rounded-lg p-3">
          <Text className="text-muted-foreground">Loading tags...</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-sm text-muted-foreground mb-2">Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {/* No tag option */}
          <Pressable
            onPress={() => onSelect(null)}
            disabled={disabled}
            className={`px-3 py-2 rounded-full border flex-row items-center ${
              selectedTagId === null
                ? 'bg-primary border-primary'
                : 'bg-background border-border'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            <TagIcon
              size={14}
              color={selectedTagId === null ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              className={`ml-1 font-medium ${
                selectedTagId === null
                  ? 'text-primary-foreground'
                  : 'text-foreground'
              }`}
            >
              None
            </Text>
          </Pressable>

          {/* User tags */}
          {tags.map((tag) => (
            <Pressable
              key={tag.id}
              onPress={() => onSelect(tag.id)}
              disabled={disabled}
              className={`px-3 py-2 rounded-full border flex-row items-center ${
                selectedTagId === tag.id
                  ? 'border-transparent'
                  : 'bg-background border-border'
              } ${disabled ? 'opacity-50' : ''}`}
              style={
                selectedTagId === tag.id
                  ? { backgroundColor: tag.color }
                  : undefined
              }
            >
              <View
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: tag.color }}
              />
              <Text
                className={`font-medium ${
                  selectedTagId === tag.id
                    ? 'text-white'
                    : 'text-foreground'
                }`}
              >
                {tag.name}
              </Text>
            </Pressable>
          ))}

          {/* Add tag button */}
          {onCreateTag && (
            <Pressable
              onPress={onCreateTag}
              disabled={disabled}
              className={`px-3 py-2 rounded-full border border-dashed border-border flex-row items-center ${
                disabled ? 'opacity-50' : ''
              }`}
            >
              <Plus size={14} className="text-muted-foreground" />
              <Text className="ml-1 text-muted-foreground font-medium">
                Add
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
