<h1>NextLogin</h1>
<p>Une petite application web développée avec <strong>React</strong>, <strong>Next.js</strong> et <strong>TypeScript</strong> pour le frontend, et <strong>Express</strong> avec <strong>TypeScript</strong> pour le backend. L'application propose une authentification basique avec la possibilité de créer un utilisateur et de se déconnecter.</p>

<h2>🛠️ Technologies utilisées</h2>
<ul>
    <li><strong>Next.js</strong></li>
    <li><strong>CSS / Styled Components / Tailwind</strong></li>
    <li><strong>Fetch API Backend</strong></li>
    <li><strong>Express.js</strong></li>
    <li><strong>MySQL</strong></li>
</ul>

<h2>📌 Crédits</h2>
<p>• Ce projet utilise le template <strong>NextAdmin</strong>.</p>
<p>• <a href="https://github.com/NextAdminHQ/nextjs-admin-dashboard" target="_blank">Lien vers NextAdmin</a></p>
<p>Merci aux créateurs pour leur travail !</p>

<h2>📌 Fonctionnalités</h2>
<ul>
    <li>✅ Connexion utilisateur</li>
    <li>✅ Création d'un utilisateur</li>
    <li>✅ Déconnexion</li>
</ul>

<h2>🚀 Installation et exécution</h2>
<ol>
    <li><strong>Cloner le dépôt</strong><br>
        <code>git clone https://github.com/AndryMSI3/NextLogin.git</code>
    </li>
    <li><strong>Configurer le backend</strong><br>
        Avant d'installer les dépendances, créer les fichiers suivants à la racine:
        <br>
        <strong>Fichier <code>.env</code> :</strong>
        <pre>
DB_HOST=le_nom_de_votre_localhost
DB_USER=votre_nom_utilisateur_de_la_base_de_donnée
DB_PASSWORD=mot_de_passe_de_votre_base_de_donnée
DB_NAME=nextLogin
        </pre>
        <strong>Fichier <code>.my.cnf</code> :</strong>
        <pre>
[client]
user = votre_nom_utilisateur_de_la_base_de_donnée
password = mot_de_passe_de_votre_base_de_donnée
        </pre>
    </li>
    <li><strong>Installer les dépendances</strong><br>
        <strong>Frontend :</strong><br>
        <code>cd client</code><br>
        <code>npm install</code><br>
        <code>npm run dev</code><br>
        <strong>Backend :</strong><br>
        <code>cd nodejs-express-mysql</code><br>
        <code>npm install</code><br>
        <code>ts-node server.ts</code>
    </li>
</ol>

<h2>🏗️ Structure du projet</h2>
<pre>
NextLogin/
│── client/  # Next.js (React + TypeScript)
│── nodejs-express-mysql/   # Express.js (TypeScript)
│── README.md
</pre>

<h2>📸 Aperçu</h2>
<h3>Page de Connexion</h3>
<img src="screenshot/screen1.png" alt="Page de connexion" width="600" />

<h3>Page de l'interface principale</h3>
<img src="screenshot/screen2.png" alt="Page d'inscription" width="600" />

<h2>📜 Licence</h2>
<p>Ce projet est sous licence <strong>MIT</strong>.</p>
