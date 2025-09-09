import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CaretDown } from 'phosphor-react';
import { Tooltip } from '../ui/Tooltip';
import { SearchInput } from '../ui/SearchInput';
import { StudentListItem } from '../ui/StudentListItem';
import { PopoverHeader } from '../ui/PopoverHeader';
import { cn } from '../../utils/cn';

interface Student {
  id: string;
  name: string;
  lastLesson: string;
}

interface StudentSelectorProps {
  students?: Student[];
  selectedStudent?: Student | null;
  onStudentSelect?: (student: Student | null) => void;
  className?: string;
  isLocked?: boolean;
  lockedMessage?: string;
}

// Mock student data matching the screenshot
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Gabe Watson',
    lastLesson: 'May 21, 2025 at 3:00 PM'
  },
  {
    id: '2',
    name: 'Mary James',
    lastLesson: 'May 19, 2025 at 4:15 PM'
  },
  {
    id: '3',
    name: 'Kai Chan',
    lastLesson: 'May 6, 2025 at 5:30 PM'
  },
  {
    id: '4',
    name: 'Beau Jackson',
    lastLesson: 'May 4, 2025 at 5:00 PM'
  },
  {
    id: '5',
    name: 'Joni Eckman',
    lastLesson: 'May 1, 2025 at 3:30 PM'
  }
];

/**
 * Student selector component with dropdown popover
 * Allows users to select a specific student or "All students"
 * Features search functionality and displays last lesson dates
 */
export const StudentSelector: React.FC<StudentSelectorProps> = ({
  students = mockStudents,
  selectedStudent,
  onStudentSelect,
  className,
  isLocked = false,
  lockedMessage
}) => {
  const [internalSelectedStudent, setInternalSelectedStudent] = useState<Student | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled state
  const currentSelectedStudent = selectedStudent !== undefined ? selectedStudent : internalSelectedStudent;

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Calculate popover position
  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 400; // Approximate height
    const popoverWidth = 320; // 80 * 4 = 320px (w-80)
    
    // Position above the trigger with some margin
    const top = rect.top - popoverHeight - 8;
    const left = Math.max(8, rect.left - (popoverWidth - rect.width) / 2);
    
    setPopoverPosition({ top, left });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update position when opening
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      // Recalculate on window resize
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (isLocked) return; // Don't allow opening when locked
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleStudentSelect = (student: Student | null) => {
    if (selectedStudent === undefined) {
      // Uncontrolled mode - manage state internally
      setInternalSelectedStudent(student);
    }
    onStudentSelect?.(student);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayText = currentSelectedStudent ? currentSelectedStudent.name : 'All students';

  // Popover content
  const popoverContent = isOpen ? (
    <div 
      ref={dropdownRef}
      className="fixed w-80 bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{
        top: popoverPosition.top,
        left: popoverPosition.left,
        zIndex: 999999, // Very high z-index to appear above everything
        maxHeight: '400px'
      }}
    >
      {/* Header */}
      <PopoverHeader title="Chat about a specific student" />
      
      {/* Search Input */}
      <div className="p-4 border-b border-gray-100">
        <SearchInput
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Student List */}
      <div className="max-h-64 overflow-y-auto">
        {/* All Students Option - at the top */}
        <StudentListItem
          name="All students"
          lastLesson="Show conversations for all students"
          isSelected={currentSelectedStudent === null}
          onClick={() => handleStudentSelect(null)}
        />
        
        {filteredStudents.map((student) => (
          <StudentListItem
            key={student.id}
            name={student.name}
            lastLesson={student.lastLesson}
            isSelected={currentSelectedStudent?.id === student.id}
            onClick={() => handleStudentSelect(student)}
          />
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      {isLocked && lockedMessage ? (
        <Tooltip content={lockedMessage} position="top" className="max-w-[276px]">
          <div
            ref={triggerRef}
            className="flex items-center justify-center gap-2 px-3 py-1 rounded transition-colors cursor-default"
          >
            <span className="font-medium text-xs tracking-[0.4px] text-gray-700">
              {displayText}
            </span>
          </div>
        </Tooltip>
      ) : (
        <div
          ref={triggerRef}
          className={`flex items-center justify-center gap-2 px-3 py-1 rounded transition-colors ${
            isLocked 
              ? 'cursor-default' 
              : 'hover:bg-gray-50 cursor-pointer group'
          }`}
          onClick={isLocked ? undefined : handleToggle}
        >
          <span className={`font-medium text-xs tracking-[0.4px] transition-colors ${
            isLocked 
              ? 'text-gray-700' 
              : 'text-[#cdcbd4] group-hover:text-brand-primary'
          }`}>
            {displayText}
          </span>
          {!isLocked && (
            <CaretDown size={12} weight="regular" className="text-[#cdcbd4] group-hover:text-brand-primary transition-colors" />
          )}
        </div>
      )}

      {/* Render popover in portal to escape stacking context */}
      {!isLocked && popoverContent && createPortal(popoverContent, document.body)}
    </div>
  );
};