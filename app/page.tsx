'use client';

import { useState, useEffect } from 'react';

type TagType = '衣' | '食' | '住' | '行' | '其他';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  tags: TagType[];
}

type GroupType = 'date' | 'tag';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupType>('date');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const TAGS: TagType[] = ['衣', '食', '住', '行', '其他'];

  // 从localStorage加载todos
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const loadedTodos = JSON.parse(savedTodos) as Todo[];
      setTodos(loadedTodos);
      if (loadedTodos.length > 0) {
        const dates = [...new Set(loadedTodos.map(todo => todo.date))];
        const latestDate = dates.sort((a, b) => 
          new Date(b as string).getTime() - new Date(a as string).getTime()
        )[0];
        setActiveFilter(latestDate);
        setActiveGroup('date');
      }
    }
  }, []);

  // 保存todos到localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        date: selectedDate,
        tags: selectedTags
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo('');
      setSelectedTags([]);
      setActiveFilter(selectedDate);
      setActiveGroup('date');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTag = (tag: TagType) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 按日期对待办事项进行分组
  const groupedByDate = todos.reduce((groups: { [key: string]: Todo[] }, todo) => {
    const date = todo.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(todo);
    return groups;
  }, {});

  // 按标签对待办事项进行分组
  const groupedByTag = todos.reduce((groups: { [key in TagType]: Todo[] }, todo) => {
    const todoTags: TagType[] = todo.tags.length > 0 ? todo.tags : ['其他'];
    todoTags.forEach(tag => {
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(todo);
    });
    return groups;
  }, { '衣': [], '食': [], '住': [], '行': [], '其他': [] });

  // 获取所有日期并排序
  const dates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b as string).getTime() - new Date(a as string).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 根据当前选择的分组和过滤器获取待办事项
  const getFilteredTodos = () => {
    if (activeGroup === 'date' && activeFilter) {
      return groupedByDate[activeFilter] || [];
    } else if (activeGroup === 'tag' && activeFilter) {
      return groupedByTag[activeFilter as TagType] || [];
    }
    return [];
  };

  const filteredTodos = getFilteredTodos();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* 侧边栏 */}
        <div className="w-64 min-h-screen bg-white shadow-lg">
          <div className="p-4">
            {/* 标签分组 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">标签分组</h2>
              <div className="space-y-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveGroup('tag');
                      setActiveFilter(tag);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeGroup === 'tag' && activeFilter === tag
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {tag} ({groupedByTag[tag]?.length || 0})
                  </button>
                ))}
              </div>
            </div>

            {/* 日期分组 */}
            <div>
              <h2 className="text-lg font-bold mb-4">日期分组</h2>
              <div className="space-y-2">
                {dates.map(date => (
                  <button
                    key={date}
                    onClick={() => {
                      setActiveGroup('date');
                      setActiveFilter(date);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeGroup === 'date' && activeFilter === date
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {formatDate(date)} ({groupedByDate[date]?.length || 0})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">待办事项清单</h1>
            
            <form onSubmit={addTodo} className="mb-6">
              <div className="flex flex-col gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 flex-wrap">
                  {TAGS.slice(0, -1).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="添加新的待办事项..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                  >
                    添加
                  </button>
                </div>
              </div>
            </form>

            {activeFilter && (
              <div className="space-y-3">
                <h2 className="font-semibold text-lg text-gray-700">
                  {activeGroup === 'date' 
                    ? formatDate(activeFilter)
                    : `${activeFilter}标签`
                  }
                </h2>
                <ul className="space-y-3">
                  {filteredTodos.map(todo => (
                    <li
                      key={todo.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow"
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                          {todo.text}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1 items-center text-sm">
                          {/* 显示日期 */}
                          {activeGroup === 'tag' && (
                            <span className="text-gray-500">
                              {formatDate(todo.date)}
                            </span>
                          )}
                          {/* 显示标签 */}
                          {todo.tags.length > 0 && (
                            <div className="flex gap-1">
                              {todo.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="px-3 py-1 text-sm text-red-500 hover:bg-red-100 rounded"
                      >
                        删除
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {(!activeFilter || filteredTodos.length === 0) && (
              <p className="text-center text-gray-500 mt-4">
                暂无待办事项
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
