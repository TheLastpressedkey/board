import { supabase } from '../lib/supabase';

export interface Document {
  id: string;
  title: string;
  content: string;
  format: 'markdown' | 'text';
  version: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentData {
  title: string;
  content: string;
  format: 'markdown' | 'text';
  tags?: string[];
}

export interface UpdateDocumentData {
  title?: string;
  content?: string;
  format?: 'markdown' | 'text';
  tags?: string[];
}

export const documents = {
  async getDocuments(): Promise<Document[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      format: doc.format,
      version: doc.version,
      tags: doc.tags || [],
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at)
    }));
  },

  async getDocument(id: string): Promise<Document | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      format: data.format,
      version: data.version,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: documentData.title,
        content: documentData.content,
        format: documentData.format,
        tags: documentData.tags || [],
        version: 1
      })
      .select()
      .single();

    if (error) throw error;

    // Create initial version
    await supabase
      .from('document_versions')
      .insert({
        document_id: data.id,
        content: documentData.content,
        version: 1,
        created_by: user.id
      });

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      format: data.format,
      version: data.version,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async updateDocument(id: string, updates: UpdateDocumentData): Promise<Document> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current document to increment version
    const currentDoc = await this.getDocument(id);
    if (!currentDoc) throw new Error('Document not found');

    const newVersion = currentDoc.version + 1;

    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        version: newVersion,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Create new version if content changed
    if (updates.content && updates.content !== currentDoc.content) {
      await supabase
        .from('document_versions')
        .insert({
          document_id: id,
          content: updates.content,
          version: newVersion,
          created_by: user.id
        });
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      format: data.format,
      version: data.version,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async deleteDocument(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async getDocumentVersions(documentId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version', { ascending: false });

    if (error) throw error;

    return (data || []).map(version => ({
      id: version.id,
      documentId: version.document_id,
      content: version.content,
      version: version.version,
      createdAt: new Date(version.created_at),
      createdBy: version.created_by
    }));
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    return (data || []).map(template => ({
      id: template.id,
      title: template.title,
      content: template.content,
      format: template.format,
      category: template.category,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at)
    }));
  }
};