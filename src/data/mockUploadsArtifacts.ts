export interface UploadArtifact {
  id: string;
  title: string;
  description: string;
  type: 'Artifact' | 'File upload';
  fileType: string;
  thumbnail?: string;
  createdAt: string;
}

export const mockUploadsArtifacts: UploadArtifact[] = [
  {
    id: 'artifact-1',
    title: 'Molecular Biology: Decoding the Language of Life (HTML Version)',
    description: 'Webpage with text and images',
    type: 'Artifact',
    fileType: 'HTML',
    thumbnail: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: '2025-05-20'
  },
  {
    id: 'artifact-2',
    title: 'Multi-level gene regulation',
    description: 'SVG',
    type: 'Artifact',
    fileType: 'SVG',
    thumbnail: 'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: '2025-05-19'
  },
  {
    id: 'upload-1',
    title: 'Screenshot 2025-05-20 at 12.59.26 PM',
    description: 'PNG',
    type: 'File upload',
    fileType: 'PNG',
    thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: '2025-05-20'
  },
  {
    id: 'artifact-3',
    title: 'Chemistry Lab Report Template',
    description: 'Document with formulas and tables',
    type: 'Artifact',
    fileType: 'HTML',
    thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: '2025-05-18'
  },
  {
    id: 'upload-2',
    title: 'Math Practice Problems Set 1',
    description: 'PDF',
    type: 'File upload',
    fileType: 'PDF',
    thumbnail: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: '2025-05-17'
  },
  {
    id: 'artifact-4',
    title: 'Interactive Geometry Lesson',
    description: 'Interactive webpage with animations',
    type: 'Artifact',
    fileType: 'HTML',
    thumbnail: 'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
    createdAt: '2025-05-16'
  }
];