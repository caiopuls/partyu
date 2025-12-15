import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function criarUsuarioOrganizador() {
  const email = 'organizador@teste.com';
  const password = 'teste123';
  const nome = 'Organizador Teste';

  console.log('🚀 Criando usuário organizador de teste...\n');

  try {
    // 1. Verificar se usuário já existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log('⚠️  Usuário já existe. Atualizando senha e perfil...');
      userId = existingUser.id;
      
      // Atualizar senha
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: password, user_metadata: { full_name: nome } }
      );
      
      if (updateError) {
        console.error('❌ Erro ao atualizar senha:', updateError.message);
        return;
      }
    } else {
      console.log('📝 Criando novo usuário...');
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: nome },
      });
      
      if (error) {
        console.error('❌ Erro ao criar usuário:', error.message);
        return;
      }
      
      userId = data.user.id;
      console.log('✅ Usuário criado!');
    }

    // 2. Atualizar perfil para organizador aprovado
    console.log('📝 Configurando perfil como organizador aprovado...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        role: 'organizer',
        status: 'approved',
        full_name: nome,
        phone: '(11) 99999-9999',
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('❌ Erro ao atualizar perfil:', profileError.message);
      return;
    }

    // 3. Criar carteira se não existir
    console.log('💰 Criando carteira...');
    const { error: walletError } = await supabase
      .from('wallets')
      .upsert({
        user_id: userId,
        balance: 0,
      }, {
        onConflict: 'user_id'
      });

    if (walletError && !walletError.message.includes('duplicate')) {
      console.log('⚠️  Aviso ao criar carteira:', walletError.message);
    }

    console.log('\n✅ Usuário organizador criado/atualizado com sucesso!\n');
    console.log('📋 CREDENCIAIS DE LOGIN:');
    console.log('   Email:', email);
    console.log('   Senha:', password);
    console.log('\n🔗 URLs:');
    console.log('   Login: http://localhost:3030/entrar');
    console.log('   Dashboard: http://localhost:3030/organizer/dashboard');
    console.log('   Criar Evento: http://localhost:3030/organizer/eventos/criar');
    console.log('\n✨ Agora você pode fazer login e acessar o dashboard!\n');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

criarUsuarioOrganizador();
